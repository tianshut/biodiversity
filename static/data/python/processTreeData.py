import csv
import json
from itertools import islice

myDict = {}
eachDict = {}
id = 1
with open('../all_data_early.csv') as f:
    f_csv = csv.reader(f)
    headers = next(f_csv)
    for line in islice(f_csv, 1, None):
        firstKey = headers[1]
        firstValue = line[1]
        eachDict[firstKey] = firstValue
        secondKey = headers[2]
        secondValue = line[2]
        eachDict[secondKey] = secondValue
        thirdKey = headers[3]
        thirdValue = line[3]
        eachDict[thirdKey] = thirdValue
        fourthKey = headers[4]
        fourthValue = line[4]
        eachDict[fourthKey] = fourthValue
        fifthKey = headers[5]
        fifthValue = line[5]
        eachDict[fifthKey] = fifthValue
        sixthKey = headers[6]
        sixthValue = line[6]
        eachDict[sixthKey] = sixthValue
        seventhKey = headers[7]
        seventhValue = line[7]
        eachDict[seventhKey] = seventhValue
        eighthKey = headers[8]
        eighthValue = line[8]
        eachDict[eighthKey] = eighthValue
        ninthKey = headers[9]
        ninthValue = line[9]
        eachDict[ninthKey] = ninthValue
        tenthKey = headers[10]
        tenthValue = line[10]
        eachDict[tenthKey] = tenthValue
        myDict[str(id)] = eachDict
        id += 1
        eachDict = {}
    jsonData=json.dumps(myDict)
    with open("../all_data_early.json",'w') as fp:
        fp.write(jsonData)
