#!/usr/bin/python3

import pymysql
from PIL import Image
import requests
from io import BytesIO


# Open database connection
db = pymysql.connect("localhost","rhulet","zxcfrewQ1!","it210b" )

# prepare a cursor object using cursor() method
cursor = db.cursor()

sql = "SELECT * FROM images WHERE uploaded = 0"

# try:
# Execute the SQL command
cursor.execute(sql)
# Fetch all the rows in a list of lists.
results = cursor.fetchall()
for row in results:
   imageId = row[0]
   imagePath = row[1]
   uploaded = row[2]
   imageApproved = row[3]
   altText = row[4]
   userId = row[5]
   
   url = "http://10.8.1.23{}".format(imagePath)
   response = requests.get(url)
   img = Image.open(BytesIO(response.content))
   img = img.resize((620,400), Image.ANTIALIAS)
   savePath = "/home/webadmin/Lab4A/Lab4A/assets{}".format(imagePath)
   img.save(savePath, 'JPEG')
   # Now print fetched result
   print ("imageId = %d,iamgePath = %s,uploaded = %d,imageApproved = %s,altText = %s" % \
      (imageId, imagePath, uploaded, imageApproved, altText ))
   sql = "UPDATE images SET uploaded = 1 WHERE imageId = {}".format(imageId)
   cursor.execute(sql)
   db.commit()
# except:
#    print ("Error: unable to fetch data")

# disconnect from server
db.close()