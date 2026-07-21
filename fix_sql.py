import codecs

path = 'src/Back_end/import-data.sql'
try:
    with codecs.open(path, 'r', 'utf-8') as f:
        content = f.read()
    content = content.replace("SET QUOTED_IDENTIFIER ON;\r\nUPDATE vehicles", "UPDATE vehicles")
    content = content.replace("SET QUOTED_IDENTIFIER ON;\nUPDATE vehicles", "UPDATE vehicles")
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Done")
except Exception as e:
    print(f"Failed with utf-8: {e}")
    # try utf-16
    with codecs.open(path, 'r', 'utf-16') as f:
        content = f.read()
    content = content.replace("SET QUOTED_IDENTIFIER ON;\r\nUPDATE vehicles", "UPDATE vehicles")
    content = content.replace("SET QUOTED_IDENTIFIER ON;\nUPDATE vehicles", "UPDATE vehicles")
    with codecs.open(path, 'w', 'utf-16') as f:
        f.write(content)
    print("Done utf-16")
