import pandas as pd

data_excel_early = pd.read_excel('../data_all_species_del_SP.xlsx', sheet_name="early T",
                                 usecols=[3, 5, 6, 8, 9, 12, 13])
data_excel_early['年龄起始值（百万年）'] *= -1
data_excel_early['年龄终止值（百万年）'] *= -1
data_excel_early.rename(columns={'种 全名': 'species_name', '现代经度': 'modern_longitude', '现代维度': 'modern_latitude',
                                 '年龄起始值（百万年）': 'start_year', '年龄终止值（百万年）': 'end_year',
                                 '古地理经度': 'ancient_longitude', '古地理纬度': 'ancient_latitude'}, inplace=True)
data_excel_early.to_csv('../data_early.csv', encoding='utf-8')

data_excel_mid = pd.read_excel('../data_all_species_del_SP.xlsx', header=None,sheet_name="mid T", usecols=[3, 5, 6, 8, 9, 12, 13])
data_excel_mid.columns=['species_name','modern_longitude','modern_latitude','start_year','end_year','ancient_longitude',
                        'ancient_latitude']
data_excel_mid['start_year'] *= -1
data_excel_mid['end_year'] *= -1
data_excel_mid.to_csv('../data_mid.csv', encoding='utf-8')

data_excel_late = pd.read_excel('../data_all_species_del_SP.xlsx', header=None,sheet_name="late T", usecols=[3, 5, 6, 8, 9, 12, 13])
data_excel_late.columns=['species_name','modern_longitude','modern_latitude','start_year','end_year','ancient_longitude',
                        'ancient_latitude']
data_excel_late['start_year'] *= -1
data_excel_late['end_year'] *= -1
data_excel_late.to_csv('../data_late.csv', encoding='utf-8')
