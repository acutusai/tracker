import sqlite3

conn = sqlite3.connect('survey_data.db')
cursor = conn.cursor()

cursor.execute('SELECT * FROM infotable')

rows = cursor.fetchall()  # Fetch all rows

count = rows  # Count the number of rows

print(f'There are {count} values in the infotable.')

conn.close()
