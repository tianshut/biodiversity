import pandas as pd

data_excel_early = pd.read_excel('../data_all_species_del_SP.xlsx', sheet_name="early T",
                                 usecols=[3, 8, 9])

data_excel_early['年龄起始值（百万年）']=data_excel_early['年龄起始值（百万年）'].astype(str)+" BC"
data_excel_early['年龄终止值（百万年）']=data_excel_early['年龄终止值（百万年）'].astype(str)+" BC"
data_excel_early.rename(columns={'种 全名': 'label', '年龄起始值（百万年）': 'start', '年龄终止值（百万年）': 'end'},
                        inplace=True)
data_excel_early.to_csv('../philosophers.csv', encoding='utf-8', index=False)
