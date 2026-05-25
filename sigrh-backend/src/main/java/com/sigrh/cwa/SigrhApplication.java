package com.sigrh.cwa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée principal de l'application SIGRH (Système Intégré de Gestion des Ressources Humaines).
 * Cette classe démarre l'application Spring Boot et initialise tous les composants configurés.
 * 
 * @author Équipe SIGRH
 * @version 1.0
 */
@SpringBootApplication
public class SigrhApplication {

	/**
	 * Méthode principale pour lancer l'application.
	 * 
	 * @param args Les arguments en ligne de commande (si nécessaire)
	 */
	public static void main(String[] args) {
		SpringApplication.run(SigrhApplication.class, args);
	}

}
