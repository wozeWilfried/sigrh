package com.sigrh.cwa.security;

import java.security.SecureRandom;

/**
 * Générateur de mots de passe aléatoires sécurisés.
 * Crée des mots de passe de 12 caractères avec lettres majuscules,
 * minuscules, chiffres et symboles.
 */
public class PasswordGenerator {

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SYMBOLS = "@#$%&!";
    private static final String ALL = UPPER + LOWER + DIGITS + SYMBOLS;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Génère un mot de passe aléatoire de 12 caractères.
     */
    public static String generate() {
        return generate(12);
    }

    /**
     * Génère un mot de passe aléatoire de la longueur spécifiée.
     */
    public static String generate(int length) {
        if (length < 4) throw new IllegalArgumentException("La longueur minimale est de 4 caractères");

        StringBuilder sb = new StringBuilder(length);
        sb.append(UPPER.charAt(RANDOM.nextInt(UPPER.length())));
        sb.append(LOWER.charAt(RANDOM.nextInt(LOWER.length())));
        sb.append(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
        sb.append(SYMBOLS.charAt(RANDOM.nextInt(SYMBOLS.length())));

        for (int i = 4; i < length; i++) {
            sb.append(ALL.charAt(RANDOM.nextInt(ALL.length())));
        }

        return sb.toString();
    }
}
