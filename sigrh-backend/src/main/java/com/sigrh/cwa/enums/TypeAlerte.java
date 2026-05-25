package com.sigrh.cwa.enums;

/**
 * Énumération des types d'alertes RH générées par l'analyse prédictive.
 * 
 * - TURNOVER: Risque de départ de l'employé
 * - ABSENTEISME: Niveau d'abséntéisme anormal
 * - CONGE_EXCESSIF: Nombre de congés excessif
 * - SALAIRE_ANORMAL: Anomalie détectée sur le salaire
 * - RETARDS_FREQUENTS: Retards fréquents répétés
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
public enum TypeAlerte {
    TURNOVER,
    ABSENTEISME,
    CONGE_EXCESSIF,
    SALAIRE_ANORMAL,
    RETARDS_FREQUENTS
}
