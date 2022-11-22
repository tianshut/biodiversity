import math
import operator
from functools import reduce

import pandas as pd

csv_list = ('../_early.csv',
            '../_mid.csv',
            '../_late.csv')

all_csv_data = []

for era, csv in enumerate(csv_list):
    csv_data = pd.read_csv(csv, index_col=[0])
    csv_data['era'] = era
    all_csv_data.append(csv_data)

all_csv = pd.concat(all_csv_data)

TIME_RANGE = (math.ceil(-251.9), math.floor(-66.0))

all_csv = all_csv[(all_csv['start_year'] <= TIME_RANGE[1])
                  & (all_csv['end_year'] >= TIME_RANGE[0])]
all_csv.loc[all_csv['start_year'] <
            TIME_RANGE[0], 'start_year'] = TIME_RANGE[0]
all_csv.loc[all_csv['end_year'] > TIME_RANGE[1], 'end_year'] = TIME_RANGE[1]

NAMES = ('Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species')
SPECIAL_VALUES = [name[0] for name in NAMES]
COL_NAMES = ['is_' + value for value in SPECIAL_VALUES]

for col_name, name, value in zip(COL_NAMES, NAMES, SPECIAL_VALUES):
    all_csv[col_name] = all_csv[name] == value

SORT_BY = [*reduce(operator.add, zip(COL_NAMES, NAMES)),
           'start_year', 'end_year']

all_csv.sort_values(by=SORT_BY, inplace=True, ascending=True)

all_csv.drop(COL_NAMES, axis=1, inplace=True)

all_csv.reset_index(drop=True, inplace=True)

all_csv['Phylum'].replace('P', 'incertae sedis', inplace=True)
all_csv['Class'].replace('C', 'incertae sedis', inplace=True)
all_csv['Order'].replace('O', 'incertae sedis', inplace=True)
all_csv['Family'].replace('F', 'incertae sedis', inplace=True)

all_csv.to_csv('../data_combined_sorted.csv', encoding='utf-8')
