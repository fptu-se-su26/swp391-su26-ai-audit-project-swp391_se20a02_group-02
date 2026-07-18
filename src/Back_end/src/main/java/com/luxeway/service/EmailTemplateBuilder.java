package com.luxeway.service;

public class EmailTemplateBuilder {

    private static final String BRAND_COLOR = "#D4AF37"; // LuxeWay Gold
    private static final String DARK_BG = "#0f172a"; // slate-900
    private static final String CARD_BG = "#1e293b"; // slate-800
    private static final String TEXT_MAIN = "#f8fafc";
    private static final String TEXT_MUTED = "#94a3b8";

    public static String buildHtmlEmail(String title, String mainContent, String ctaText, String ctaLink) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>")
            .append("<html>")
            .append("<head>")
            .append("<meta charset='UTF-8'>")
            .append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>")
            .append("<style>")
            .append("body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ").append(DARK_BG).append("; color: ").append(TEXT_MAIN).append("; }")
            .append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }")
            .append(".header { text-align: center; padding: 30px 0; border-bottom: 1px solid ").append(CARD_BG).append("; }")
            .append(".logo { font-size: 28px; font-weight: bold; color: ").append(BRAND_COLOR).append("; text-decoration: none; letter-spacing: 2px; }")
            .append(".content { background-color: ").append(CARD_BG).append("; padding: 40px; border-radius: 12px; margin-top: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }")
            .append(".title { color: ").append(BRAND_COLOR).append("; font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 20px; text-align: center; }")
            .append(".body-text { font-size: 16px; line-height: 1.6; color: ").append(TEXT_MAIN).append("; margin-bottom: 30px; }")
            .append(".cta-container { text-align: center; margin: 35px 0; }")
            .append(".cta-button { display: inline-block; background-color: ").append(BRAND_COLOR).append("; color: #000000; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; }")
            .append(".footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid ").append(CARD_BG).append("; color: ").append(TEXT_MUTED).append("; font-size: 12px; }")
            .append("</style>")
            .append("</head>")
            .append("<body>")
            .append("<div class='container'>")
            .append("  <div class='header'>")
            .append("    <a href='https://luxeway.vn' class='logo'>LUXEWAY</a>")
            .append("  </div>")
            .append("  <div class='content'>")
            .append("    <h1 class='title'>").append(title).append("</h1>")
            .append("    <div class='body-text'>").append(mainContent).append("</div>");

        if (ctaText != null && ctaLink != null) {
            html.append("    <div class='cta-container'>")
                .append("      <a href='").append(ctaLink).append("' class='cta-button'>").append(ctaText).append("</a>")
                .append("    </div>");
        }

        html.append("  </div>")
            .append("  <div class='footer'>")
            .append("    <p>© 2026 LuxeWay. Drive the Unattainable.</p>")
            .append("    <p>If you did not request this email, please safely ignore it.</p>")
            .append("  </div>")
            .append("</div>")
            .append("</body>")
            .append("</html>");

        return html.toString();
    }
}
