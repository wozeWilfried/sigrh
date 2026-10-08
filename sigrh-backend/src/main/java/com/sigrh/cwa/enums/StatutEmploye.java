package com.sigrh.cwa.enums;

/**
 * Énumération des statuts d'emploi dans SIGRH.
 * 
 * - ACTIF: Employé actuellement actif
 * - INACTIF: Employé non actif (démission, etc.)
 * - SUSPENDU: Employé temporairement suspendu
 * - EN_CONGE: Employé actuellement en congé
 * - DEPART: Employé sorti des effectifs
 * - RETRAITE: Employé parti en retraite (âge légal atteint)
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
public enum StatutEmploye {
    ACTIF, INACTIF, SUSPENDU, EN_CONGE, DEPART, RETRAITE
}
