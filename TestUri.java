import java.nio.file.Paths;
public class TestUri {
    public static void main(String[] args) {
        String uploadDir = "uploads/";
        System.out.println(Paths.get(uploadDir).toAbsolutePath().normalize().toUri().toString());
    }
}
