package com.sigrh.cwa.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    private static final String STYLE = """
        <style>
            body { margin:0; padding:0; background-color:#f4f7fc; font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif; }
            .outer { background-color:#f4f7fc; padding:30px 10px; }
            .container { max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06); }
            .header { background:linear-gradient(135deg,#1e3a5f,#2563eb); padding:28px 40px; text-align:center; }
            .header h1 { color:#ffffff; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.3px; }
            .header p { color:rgba(255,255,255,0.75); font-size:14px; margin:6px 0 0 0; }
            .body { padding:32px 40px 24px; }
            .body h2 { color:#1e293b; font-size:18px; font-weight:700; margin:0 0 8px 0; }
            .body p { color:#475569; font-size:14px; line-height:1.7; margin:0 0 16px 0; }
            .infos { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px 20px; margin:16px 0; }
            .infos dt { font-size:12px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-top:12px; }
            .infos dt:first-child { margin-top:0; }
            .infos dd { font-size:15px; font-weight:600; color:#1e293b; margin:2px 0 0 0; }
            .infos dd.code { font-family:'Courier New',monospace; font-size:16px; letter-spacing:1.5px; color:#2563eb; background:#eff6ff; display:inline-block; padding:4px 12px; border-radius:6px; }
            .btn { display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-size:14px; font-weight:700; padding:13px 32px; border-radius:10px; margin:8px 0 4px; }
            .footer { padding:20px 40px; text-align:center; border-top:1px solid #e2e8f0; }
            .footer p { color:#94a3b8; font-size:12px; margin:4px 0; line-height:1.6; }
            .footer a { color:#2563eb; text-decoration:none; font-weight:600; }
        </style>
        """;

    private String header(String subtitle) {
        return """
            <div class="header">
                <h1>SIGRH</h1>
                <p>%s</p>
            </div>
            """.formatted(subtitle);
    }

    private String footer() {
        return """
            <div class="footer">
                <p style="font-weight:700;color:#64748b;">SIGRH — Système Intégré de Gestion des Ressources Humaines</p>
                <p>Cet email a été envoyé automatiquement depuis l'application SIGRH.</p>
                <p>Si vous avez des questions, contactez <a href="mailto:%s">le support</a>.</p>
                <p style="margin-top:8px;font-size:11px;color:#cbd5e1;">© %d SIGRH Technology. Tous droits réservés.</p>
            </div>
            """.formatted(fromAddress, java.time.Year.now().getValue());
    }

    private String wrap(String title, String content) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            + STYLE + "</head><body><div class=\"outer\"><div class=\"container\">"
            + header(title)
            + "<div class=\"body\">" + content + "</div>"
            + footer()
            + "</div></div></body></html>";
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        new Thread(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromAddress);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlBody, true);

                mailSender.send(message);
                log.info("Email envoyé avec succès à {}", to);
            } catch (Exception e) {
                log.error("Erreur lors de l'envoi de l'email à {} : {}",
                    to, e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
                log.warn("Contenu (fallback) : Sujet={}", subject);
            }
        }).start();
    }

    public void sendCredentials(String to, String username, String tempPassword) {
        String body = """
            <h2>Bienvenue dans SIGRH</h2>
            <p>Votre compte utilisateur a été créé avec succès. Voici vos identifiants de connexion.</p>

            <dl class="infos">
                <dt>Identifiant</dt>
                <dd>%s</dd>
                <dt>Mot de passe temporaire</dt>
                <dd class="code">%s</dd>
                <dt>URL d'accès</dt>
                <dd>http://localhost:5173</dd>
            </dl>

            <p style="text-align:center;">
                <a href="http://localhost:5173" class="btn">Accéder à mon espace</a>
            </p>
            """.formatted(username, tempPassword);

        sendEmail(to, "Bienvenue sur SIGRH — Vos identifiants de connexion",
            wrap("Création de votre compte", body));
    }

    public void sendWelcomeMessage(String to, String username) {
        String body = """
            <h2>Bienvenue dans SIGRH</h2>
            <p>Votre dossier employé a été créé avec succès dans notre système.</p>

            <dl class="infos">
                <dt>Identifiant</dt>
                <dd>%s</dd>
                <dt>Statut</dt>
                <dd>Compte créé</dd>
            </dl>

            <p>Pour obtenir votre mot de passe et accéder à l'application, veuillez contacter votre administrateur RH.</p>
            """.formatted(username);

        sendEmail(to, "Bienvenue sur SIGRH — Votre dossier a été créé",
            wrap("Création de votre dossier", body));
    }

    public void sendPasswordChanged(String to) {
        String body = """
            <h2>Mot de passe mis à jour</h2>
            <p>Votre mot de passe SIGRH a été modifié avec succès.</p>

            <dl class="infos">
                <dt>Action</dt>
                <dd>Changement de mot de passe</dd>
                <dt>Statut</dt>
                <dd>Confirmé et appliqué</dd>
            </dl>

            <p>Si vous n'êtes pas à l'origine de cette modification, contactez le support à <a href="mailto:%s">%s</a>.</p>

            <p style="text-align:center;">
                <a href="http://localhost:5173" class="btn">Accéder à SIGRH</a>
            </p>
            """.formatted(fromAddress, fromAddress);

        sendEmail(to, "SIGRH — Votre mot de passe a été modifié",
            wrap("Sécurité du compte", body));
    }
}
