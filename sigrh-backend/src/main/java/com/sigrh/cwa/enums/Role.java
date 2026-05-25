package com.sigrh.cwa.enums;

/**
 * Énumération des rôles d'accès utilisateur dans SIGRH.
 * 
 * - ADMIN: Accès complet à l'application
 * - RH: Gestion RH complète (excepté suppressions d'admin)
 * - MANAGER: Accès aux données de son département
 * - EMPLOYE: Accès limité à ses propres données
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
public enum Role {
    ADMIN, RH, MANAGER, EMPLOYE, SECRETAIRE
}
