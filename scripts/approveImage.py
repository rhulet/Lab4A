import pymysql
from PIL import Image
import requests
from io import BytesIO
import getopt
import sys

imageId = sys.argv[1]
# userId = int(userId,10)
# Open database connection
db = pymysql.connect("localhost","rhulet","zxcfrewQ1!","it210b")

# prepare a cursor object using cursor() method
cursor = db.cursor()

sql = "UPDATE `images` SET `imageApproved` = 1 WHERE `imageId` = %s"

cursor.execute(sql, (imageId))
db.commit()