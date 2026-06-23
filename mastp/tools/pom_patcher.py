"""
mastp/tools/pom_patcher.py
Automatically checks and injects JaCoCo, Mockito, and Surefire plugins
into a Spring Boot Maven pom.xml file.

Design Principles:
  - Deterministic: no LLM calls.
  - Idempotent: running twice does NOT duplicate plugins.
  - Safe: backs up original pom.xml before modifying.
  - Compatible: works with any Spring Boot 3.x pom.xml.

Usage:
    from mastp.tools.pom_patcher import ensure_jacoco_configured
    result = ensure_jacoco_configured("/path/to/project/root")
    # result = {"patched": True, "changes": [...], "backup": "pom.xml.bak"}
"""
from __future__ import annotations

import os
import re
import shutil
import logging
from typing import Optional

logger = logging.getLogger("mastp.pom_patcher")

# ─── Sentinel strings used to detect existing configuration ───────────────────

_JACOCO_SENTINEL = "jacoco-maven-plugin"
_MOCKITO_CORE_SENTINEL = "mockito-core"
_MOCKITO_JUPITER_SENTINEL = "mockito-junit-jupiter"
_SUREFIRE_SENTINEL = "maven-surefire-plugin"

# ─── XML Fragments to inject ─────────────────────────────────────────────────

_MOCKITO_DEPS_XML = """
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- MASTP V3 — Unit Test Dependencies (auto-injected)              -->
        <!-- ═══════════════════════════════════════════════════════════════ -->

        <!-- MOCKITO CORE — for @Mock, @InjectMocks in generated tests -->
        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-core</artifactId>
            <version>5.11.0</version>
            <scope>test</scope>
        </dependency>

        <!-- MOCKITO JUNIT 5 EXTENSION — @ExtendWith(MockitoExtension.class) -->
        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-junit-jupiter</artifactId>
            <version>5.11.0</version>
            <scope>test</scope>
        </dependency>

        <!-- JUNIT 5 PARAMS — @ParameterizedTest support -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-params</artifactId>
            <scope>test</scope>
        </dependency>
"""

_JACOCO_PLUGIN_XML = """
            <!-- ══════════════════════════════════════════════════════════════ -->
            <!-- MASTP V3 — JaCoCo Coverage Plugin (auto-injected)            -->
            <!-- ══════════════════════════════════════════════════════════════ -->

            <plugin>
                <groupId>org.jacoco</groupId>
                <artifactId>jacoco-maven-plugin</artifactId>
                <version>0.8.12</version>
                <executions>
                    <execution>
                        <id>jacoco-prepare-agent</id>
                        <goals>
                            <goal>prepare-agent</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>jacoco-report</id>
                        <phase>test</phase>
                        <goals>
                            <goal>report</goal>
                        </goals>
                        <configuration>
                            <outputDirectory>${project.build.directory}/site/jacoco</outputDirectory>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
"""

_SUREFIRE_PLUGIN_XML = """
            <!-- ══════════════════════════════════════════════════════════════ -->
            <!-- SUREFIRE — JUnit 5 Platform Provider (auto-injected)         -->
            <!-- Required for mvn test to discover JUnit Jupiter @Test methods -->
            <!-- ══════════════════════════════════════════════════════════════ -->

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.5</version>
                <configuration>
                    <includes>
                        <include>**/*Test.java</include>
                    </includes>
                    <failIfNoTests>false</failIfNoTests>
                </configuration>
            </plugin>
"""


def find_pom_xml(project_root: str) -> Optional[str]:
    """Find pom.xml in project root. Returns None if not found."""
    pom_path = os.path.join(project_root, "pom.xml")
    if os.path.exists(pom_path):
        return pom_path

    # Also try one level up (in case source_root points to src/main/java)
    parts = project_root.replace("\\", "/").split("/")
    for i in range(len(parts), 0, -1):
        candidate = "/".join(parts[:i]) + "/pom.xml"
        if os.path.exists(candidate):
            return candidate

    return None


def _backup_pom(pom_path: str) -> str:
    """Create a backup of the original pom.xml. Returns backup path."""
    backup_path = pom_path + ".mastp_bak"
    if not os.path.exists(backup_path):
        shutil.copy2(pom_path, backup_path)
        logger.info(f"  📦 pom.xml backup created: {backup_path}")
    else:
        logger.info(f"  📦 pom.xml backup already exists, skipping: {backup_path}")
    return backup_path


def ensure_jacoco_configured(project_root: str) -> dict:
    """
    Check the project's pom.xml and inject JaCoCo, Mockito, and Surefire
    configurations if they are missing.

    Returns a result dict:
    {
        "patched": bool,            # True if any changes were made
        "already_configured": bool, # True if JaCoCo was already present
        "changes": [str],           # List of human-readable changes made
        "backup": str | None,       # Path to backup file
        "pom_path": str | None,     # Resolved pom.xml path
        "error": str | None,        # Error message if anything failed
    }
    """
    result = {
        "patched": False,
        "already_configured": False,
        "changes": [],
        "backup": None,
        "pom_path": None,
        "error": None,
    }

    pom_path = find_pom_xml(project_root)
    if not pom_path:
        msg = f"pom.xml not found in: {project_root}"
        logger.error(f"  ✗ {msg}")
        result["error"] = msg
        return result

    result["pom_path"] = pom_path
    logger.info(f"  ✓ Found pom.xml: {pom_path}")

    try:
        with open(pom_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        result["error"] = f"Failed to read pom.xml: {e}"
        return result

    # Check what's already present
    has_jacoco = _JACOCO_SENTINEL in content
    has_mockito_core = _MOCKITO_CORE_SENTINEL in content
    has_mockito_jupiter = _MOCKITO_JUPITER_SENTINEL in content
    has_surefire = _SUREFIRE_SENTINEL in content

    if has_jacoco and has_mockito_core and has_mockito_jupiter and has_surefire:
        logger.info("  ✓ pom.xml already has JaCoCo, Mockito, and Surefire. No changes needed.")
        result["already_configured"] = True
        return result

    # Create backup before modifying
    try:
        backup_path = _backup_pom(pom_path)
        result["backup"] = backup_path
    except Exception as e:
        result["error"] = f"Failed to backup pom.xml: {e}"
        return result

    modified = content
    changes = []

    # ── Inject Mockito dependencies (before </dependencies>) ─────────────
    if not has_mockito_core or not has_mockito_jupiter:
        # Find the closing </dependencies> tag
        deps_close = modified.rfind("</dependencies>")
        if deps_close != -1:
            modified = modified[:deps_close] + _MOCKITO_DEPS_XML + "\n    " + modified[deps_close:]
            changes.append("Injected Mockito Core + JUnit Jupiter dependencies")
            logger.info("  + Injected Mockito dependencies into <dependencies>")
        else:
            logger.warning("  ⚠ Could not find </dependencies> to inject Mockito deps")

    # ── Inject JaCoCo plugin (before </plugins>) ──────────────────────────
    if not has_jacoco:
        plugins_close = modified.rfind("</plugins>")
        if plugins_close != -1:
            modified = modified[:plugins_close] + _JACOCO_PLUGIN_XML + "\n        " + modified[plugins_close:]
            changes.append("Injected jacoco-maven-plugin 0.8.12")
            logger.info("  + Injected JaCoCo plugin into <build><plugins>")
        else:
            logger.warning("  ⚠ Could not find </plugins> to inject JaCoCo plugin")

    # ── Inject Surefire (before </plugins>) ──────────────────────────────
    if not has_surefire:
        # Re-find after previous injection
        plugins_close = modified.rfind("</plugins>")
        if plugins_close != -1:
            modified = modified[:plugins_close] + _SUREFIRE_PLUGIN_XML + "\n        " + modified[plugins_close:]
            changes.append("Injected maven-surefire-plugin 3.2.5 with JUnit 5 platform")
            logger.info("  + Injected Surefire plugin into <build><plugins>")
        else:
            logger.warning("  ⚠ Could not find </plugins> to inject Surefire plugin")

    # Write modified pom.xml
    if changes:
        try:
            with open(pom_path, "w", encoding="utf-8") as f:
                f.write(modified)
            logger.info(f"  ✓ pom.xml updated successfully ({len(changes)} change(s))")
            result["patched"] = True
            result["changes"] = changes
        except Exception as e:
            # Restore backup on write failure
            if result["backup"]:
                shutil.copy2(result["backup"], pom_path)
                logger.error(f"  ✗ Write failed, restored backup: {e}")
            result["error"] = f"Failed to write modified pom.xml: {e}"

    return result


def restore_pom_backup(project_root: str) -> bool:
    """
    Restore the original pom.xml from backup if it exists.
    Useful for cleanup after testing.
    Returns True if restored, False if no backup was found.
    """
    pom_path = find_pom_xml(project_root)
    if not pom_path:
        return False

    backup_path = pom_path + ".mastp_bak"
    if os.path.exists(backup_path):
        shutil.copy2(backup_path, pom_path)
        os.remove(backup_path)
        logger.info(f"  ✓ Restored original pom.xml from backup")
        return True

    logger.info("  ⚠ No pom.xml backup found to restore")
    return False
