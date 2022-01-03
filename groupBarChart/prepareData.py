import pandas as pd
import numpy as np

# On combine les deux fichiers CSV client
combined_clients = pd.concat([pd.read_csv("data/Clients_0.csv", encoding='latin-1'), pd.read_csv("data/Clients_8.csv", encoding='latin-1')])

# On recupere le fichier Immatriculations.csv
immatriculations = pd.read_csv("data/Immatriculations.csv", encoding='latin-1')

# On ajoute la colonne "Categorie" aux donnees d'Immatriculations
#####################################################################################
# Definition des conditions dans l'ordre des valeurs associees a la suite
conditions = [
    ((immatriculations['longueur'] == 'moyenne') | (immatriculations['longueur'] == 'courte')) & (immatriculations['nbPortes'] <= 5) & (immatriculations['puissance'] < 100),
    (immatriculations['longueur'] != 'très longue'),
    (immatriculations['puissance'] >= 300),
    (immatriculations['longueur'] == 'très longue') & (immatriculations['nbPortes'] >= 5),
    (immatriculations['longueur'] != 'courte') & (immatriculations['nbPortes'] >= 5)
]

# Valeurs dans l'ordre des conditions de critere definis ci-dessus
values = ['Citadine', 'Routiere', 'Sportive', 'Berline', 'SUV']
immatriculations['Categorie'] = np.select(conditions, values)
#####################################################################################

# On combine les deux dataframes selon la colonne commune qui est "immatriculation"
combined_client_and_immatriculation = pd.merge(combined_clients, immatriculations, on='immatriculation')


processData = combined_client_and_immatriculation

processData = processData[processData.age != ' ']
processData = processData[processData.age != '?']
processData = processData[processData.age != '-1']
print(processData['age'].unique())

processData["age"] = pd.to_numeric(processData["age"])


#processData = processData[(processData['closing_price'] >= 99) & (processData['closing_price'] <= 101)]

ageRange = [
    (processData['age'] < 25),
    (processData['age'] >= 26) & (processData['age'] <= 45),
    (processData['age'] >= 46) & (processData['age'] <= 65),
    (processData['age'] > 65)
]

#df = df[(df['age'] >= 99) & (df['age'] <= 101)]

# Valeurs dans l'ordre des conditions de critere definis ci-dessus
values = ['-25','26-45','46-65','+66']
processData['age'] = np.select(ageRange, values)




processData['situationFamiliale'].replace({
        'Seule': 'Celibataire',
        'Seul': 'Celibataire',
        'Célibataire': 'Celibataire',
        'Divorcée': 'Divorce',
        'Marié(e)': 'Marie',
        ' ': '?',
        'N/D': '?',
    }, inplace=True)

processData = processData[processData['situationFamiliale'] != '?']

print(processData['situationFamiliale'].unique())
#print(processData['age'])

print(processData.describe(include='all'))


#print(processData.loc[processData.nbEnfantsAcharge == '6', 'nbEnfantsAcharge'].count())


# On genere le csv correspondant au resultat
processData.to_csv("Clients_Immatriculations_d3.csv", index=False, encoding='latin-1')