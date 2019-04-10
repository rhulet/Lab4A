#!/usr/bin/python3

import pymysql
from PIL import Image
import requests
from io import BytesIO
import sys, os, stat

imageId = sys.argv[1]


# Open database connection
db = pymysql.connect("localhost","rhulet","zxcfrewQ1!","it210b" )

# prepare a cursor object using cursor() method
cursor = db.cursor()

sql = "SELECT * FROM images WHERE imageId = %s"

# try:
# Execute the SQL command
cursor.execute(sql, (imageId))
# Fetch all the rows in a list of lists.
results = cursor.fetchall()
for row in results:
   imageId = row[0]
   imagePath = row[1]
   uploaded = row[2]
   imageApproved = row[3]
   altText = row[4]
   userId = row[5]

   sql = "DELETE FROM `images` WHERE `imageId` = %s"
   cursor.execute(sql, (imageId))
   db.commit()
   savePath = "/home/webadmin/Lab4A/Lab4A/assets{}".format(imagePath)
   os.chmod(savePath, stat.S_IXOTH)
   os.remove(savePath);