# Cahier des Charges - Application Mobile Mahfazati
Version 1.0 | Date: 31/08/2026

## 1. NOM ET VISION
**Nom**: Mahfazati - محفظتي  
**Signification**: "Mon Portefeuille"  
**Slogan**: "Dépense moins. Atteins plus."  
**Vision**: Aider les particuliers à reprendre le contrôle de leurs dépenses quotidiennes grâce à un suivi simple + un coach IA qui propose des corrections concrètes pour atteindre des objectifs d’épargne.

## 2. PROBLÈME À RÉSOUDRE
Les gens ne savent pas où part leur argent au quotidien. Les apps bancaires sont complexes. Il manque un outil simple, en Darija/Français, qui dit: "Tu as dépensé combien aujourd’hui, pourquoi, et comment faire mieux demain".

## 3. CIBLE
- Jeunes salariés 20-35 ans au Maroc
- Étudiants et familles avec budget serré
- Personnes qui paient en cash et par carte

## 4. FONCTIONNALITÉS PRINCIPALES V1.0

### 4.1. Gestion du Budget
- **Fixer un objectif mensuel**: L’utilisateur définit "Budget du mois" ex: 4000 MAD
- **Découpage auto par l’IA**: L’app propose une répartition: Factures, Bouffe, Transport, Perso
- **Ajout rapide de dépense**: 3 clics max. Montant + Catégorie + Note optionnelle
- **Modes de paiement**: Cash, Carte, Virement
- **Dashboard**: Barre de progression "Jour 12/30 - 42% du budget utilisé"

### 4.2. Coach IA "Coach Mahfazati"
Logique: Objectif → Suivi → Diagnostic → Correction → Nouvel Objectif

- **Si dépassement**: 
  Diagnostic: "Tu as dépassé de 320 MAD. Cause: Livraisons +450 MAD vs mois dernier"
  Correction: Proposer 2 actions concrètes. Ex: "Plafond 150 MAD/semaine pour Glovo"
- **Si objectif atteint**:
  Félicitations + Proposition nouveau objectif: "-5% à -10% sur le mois suivant"
- **Bilan Hebdo**: 1 conseil personnalisé par semaine
- **Simulation "Et si..."**: "Si tu continues, tu auras économisé 2400 MAD dans 6 mois"

### 4.3. Catégories et Rapports
Catégories par défaut: Factures, Logement, Bouffe, Transport, Santé, Perso, Famille, Autre
- Graphique simple: Camembert des dépenses du mois
- Historique: Aujourd’hui / Semaine / Mois / Année

### 4.4. Gamification
- **Score du mois**: /100 en fonction du respect du budget
- **Streak**: "7 jours sans dépasser ton budget resto"

## 5. EXIGENCES TECHNIQUES

### 5.1. Plateformes
- Android 8.0+ et iOS 14+
- Langues: Français, Arabe, Darija via interface

### 5.2. Tech
- **Frontend**: React Native ou Flutter pour iOS + Android
- **Backend**: Node.js / Firebase
- **Base de données**: Firestore / SQLite local pour mode offline
- **IA**: GPT-4o mini ou Claude via API pour générer diagnostics et conseils
- **Sécurité**: Données chiffrées localement. Pas de connexion bancaire en V1.

### 5.3. UX/UI
- Design simple, 1 écran = 1 action
- Saisie vocale en Darija pour ajouter une dépense
- Mode sombre
- Pas d’inscription obligatoire. L’app doit marcher offline.

## 6. PARCOURS UTILISATEUR TYPE
1.  Onboarding 1min: Revenu, Objectif 1er mois
2.  Écran Accueil: "Aujourd’hui -320 MAD. Il te reste 3680 MAD"
3.  Ajouter dépense: "45 MAD - Café"
4.  Alerte IA: "Tu dépasses sur les cafés. On passe à 3/semaine ?"
5.  Fin de mois: Bilan + "Mois prochain on vise 3800 MAD. On valide ?"

## 7. ROADMAP
**V1.0 - MVP 1 mois**: Ajout manuel, Dashboard, 1 conseil IA/semaine, 1 objectif
**V1.1 - 2 mois**: Scan de facture photo, Rappels
**V1.2 - 3 mois**: Export PDF, Sauvegarde Cloud
**V2.0**: Connexion bancaire auto, Prédictions IA

## 8. CRITÈRES DE SUCCÈS
- Utilisateur ajoute au moins 10 dépenses le 1er mois
- 60% des utilisateurs atteignent leur 1er objectif
- Temps pour ajouter une dépense < 5 secondes

## 9. CE QU’ON NE FAIT PAS EN V1
- Connexion bancaire automatique
- Investissement / Crypto
- Partage de compte à plusieurs