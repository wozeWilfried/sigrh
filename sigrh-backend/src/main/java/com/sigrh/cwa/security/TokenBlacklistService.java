package com.sigrh.cwa.security;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class TokenBlacklistService {

    private final ConcurrentHashMap<String, Date> blacklist = new ConcurrentHashMap<>();

    public void blacklist(String tokenId, Date expiry) {
        blacklist.put(tokenId, expiry);
    }

    public boolean isBlacklisted(String tokenId) {
        Date expiry = blacklist.get(tokenId);
        if (expiry == null) return false;
        if (expiry.before(new Date())) {
            blacklist.remove(tokenId);
            return false;
        }
        return true;
    }

    @Scheduled(fixedRate = 300_000)
    @PostConstruct
    public void cleanExpired() {
        int before = blacklist.size();
        Date now = new Date();
        blacklist.values().removeIf(e -> e.before(now));
        int removed = before - blacklist.size();
        if (removed > 0) {
            log.debug("Nettoyage blacklist: {} entrées expirées supprimées", removed);
        }
    }
}
