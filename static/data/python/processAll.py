import pandas as pd

xlsx = data_excel_earlyT = pd.read_excel(
    '../data_all_species0515_.xlsx', sheet_name=None, usecols=[0, 1, 2, 3, 4, 6, 14, 15, 17, 18, 21, 22])

for sheet_name, sheet in xlsx.items():
    if sheet_name == 'Sheet1':
        continue
    sheet.dropna(inplace=True)
    sheet['年龄早值'] *= -1
    sheet['年龄晚值'] *= -1
    sheet.rename(columns={
        '门': 'Phylum',
        '纲': 'Class',
        '目': 'Order',
        '科': 'Family',
        '属': 'Genus',
        '种': 'Species',
        '经度': 'modern_longitude',
        '纬度': 'modern_latitude',
        '年龄早值': 'start_year',
        '年龄晚值': 'end_year',
        '古经度': 'ancient_longitude',
        '古纬度': 'ancient_latitude',
    }, inplace=True)
    sheet.to_csv(
        '../all_data_{}.csv'.format(str(sheet_name).replace(' ', '')), encoding='utf-8')
