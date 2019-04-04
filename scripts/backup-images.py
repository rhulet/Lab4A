import os
import shutil

src = "/home/webadmin/Lab4A/Lab4A/node/assets/images/"
dest = "/home/webadmin/Pictures/"

src_files = os.listdir(src)
for file_name in src_files:
    full_file_name = os.path.join(src, file_name)
    if (os.path.isfile(full_file_name)):
        shutil.copy(full_file_name, dest)