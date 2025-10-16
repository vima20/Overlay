# User Stories - FIFA Karsinta-ottelut JA Veikkausliiga Overlay

## 1. Chrome Extension - Desktop

### A) Desktop-käyttäjä:
```
Käyttäjänä Yle Areena -sivulla
Haluan nähdä FIFA karsinta-otteluiden ja Veikkausliiga otteluiden overlay:n
Jotta voin seurata otteluita sivulla ollessani
```

### B) Desktop-käyttäjä:
```
Käyttäjänä Chrome-selaimessa
Haluan avata overlay:n näppäinkomennolla (Ctrl+J)
Jotta voin nopeasti nähdä ottelut
```

### C) Desktop-käyttäjä:
```
Käyttäjänä Yle Areena -sivulla
Haluan klikata "Avaa Areena" -linkkiä
Jotta voin siirtyä suoraan otteluun
```

## 2. React App (PWA) - Mobiili

### A) Mobiili-käyttäjä:
```
Käyttäjänä kännykässä
Haluan asentaa sovelluksen kännykkääni
Jotta voin käyttää sitä nopeasti
```

### B) Mobiili-käyttäjä:
```
Käyttäjänä kännykässä
Haluan klikata tekstiä avatakseni overlay:n
Jotta voin nähdä ottelut kosketusnäytöllä
```

### C) Mobiili-käyttäjä:
```
Käyttäjänä kännykässä
Haluan käyttää sovellusta offline-tilassa
Jotta voin nähdä ottelut ilman internettiä
```

## 3. Yleinen

### A) Jalkapallofani:
```
Käyttäjänä jalkapallofani
Haluan nähdä FIFA karsinta-otteluiden ja Veikkausliiga otteluiden tiedot
Jotta voin seurata suosikkijoukkueitani
```

### B) Yle Areena -käyttäjä:
```
Käyttäjänä Yle Areena -sivulla
Haluan nähdä otteluiden overlay:n sivulla
Jotta voin seurata otteluita samalla kun katselen sivua
```

### C) Mobiili-käyttäjä:
```
Käyttäjänä kännykässä
Haluan käyttää sovellusta nopeasti
Jotta voin tarkistaa ottelut heti
```

## 4. Tekninen

### A) Kehittäjä:
```
Kehittäjänä
Haluan että sovellus toimii kaikilla laitteilla
Jotta voin tukea kaikkia käyttäjiä
```

### B) Kehittäjä:
```
Kehittäjänä
Haluan että sovellus on helppo ylläpitää
Jotta voin kehittää sitä jatkuvasti
```

### C) Kehittäjä:
```
Kehittäjänä
Haluan että sovellus on nopea
Jotta käyttäjät saavat hyvän kokemuksen
```

## 5. Business

### A) Yle:
```
Ylenä
Haluan että käyttäjät pysyvät sivullani pidempään
Jotta voin lisätä engagementia
```

### B) Yle:
```
Ylenä
Haluan että käyttäjät saavat lisäarvoa sivullani
Jotta voin parantaa käyttökokemusta
```

### C) Yle:
```
Ylenä
Haluan että käyttäjät käyttävät sivua enemmän
Jotta voin lisätä liikennettä
```

## 6. Acceptance Criteria

### A) Chrome Extension:
```
Given: Käyttäjä on Yle Areena -sivulla
When: Käyttäjä painaa Ctrl+J
Then: Overlay aukeaa sivulle
And: Näyttää FIFA karsinta-otteluiden ja Veikkausliiga otteluiden tiedot
```

### B) React App:
```
Given: Käyttäjä on kännykässä
When: Käyttäjä klikkaa tekstiä
Then: Overlay aukeaa sovellukseen
And: Näyttää FIFA karsinta-otteluiden ja Veikkausliiga otteluiden tiedot
```

### C) PWA:
```
Given: Käyttäjä on kännykässä
When: Käyttäjä asentaa sovelluksen
Then: Sovellus on kännykässä
And: Toimii offline-tilassa
```

## 7. Edge Cases

### A) Offline-tilanne:
```
Käyttäjänä ilman internettiä
Haluan käyttää sovellusta
Jotta voin nähdä ottelut offline-tilassa
```

### B) Virhe-tilanne:
```
Käyttäjänä virhe-tilanteessa
Haluan nähdä virheviestin
Jotta tiedän mitä tapahtui
```

### C) Hitaa verkkoa:
```
Käyttäjänä hitaassa verkossa
Haluan että sovellus latautuu nopeasti
Jotta voin käyttää sitä heti
```

## 8. Prioriteetti

1. **Desktop:** Chrome Extension → Yle Areena -sivulla
2. **Mobiili:** React App (PWA) → asennettu kännykkään
3. **Yleinen:** Jalkapallofani → otteluiden seuranta
4. **Tekninen:** Kehittäjä → helppo ylläpitää
5. **Business:** Yle → lisää engagementia
