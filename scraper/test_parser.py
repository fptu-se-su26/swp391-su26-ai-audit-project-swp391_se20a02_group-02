from bs4 import BeautifulSoup

file_path = "data/html_sources/Mioto - Ứng dụng cho thuê xe tự lái & có tài xế 4-7 chỗ.html"

with open(file_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

item = soup.select_one(".item-car .desc-car")
if item:
    print(item.prettify())
