import sqlite3

conn = sqlite3.connect('additional_urls.db')
cursor = conn.cursor()

cursor.execute('SELECT * FROM urls')

rows = cursor.fetchall()  # Fetch all rows

count = rows  # Count the number of rows

print(f'There are {count} values in the infotable.')

conn.close()
