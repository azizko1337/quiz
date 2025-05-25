# Szybkie Quizy – Projekt zaliczeniowy

Aplikacja webowa oraz mobilna do tworzenia i rozwiązywania quizów, stworzona na zaliczenie dwóch przedmiotów na studiach:  
**Projektowanie Webowych Aplikacji Graficznych** oraz **Projektowanie Aplikacji Mobilnych**.

## Spis treści

- [Opis projektu](#opis-projektu)
- [Funkcjonalności](#funkcjonalności)
- [Technologie](#technologie)
- [Struktura projektu](#struktura-projektu)
- [Uruchamianie](#uruchamianie)
- [Autor](#autor)

---

## Opis projektu

Projekt umożliwia tworzenie, edycję oraz rozwiązywanie quizów zarówno w wersji webowej (frontend + backend), jak i mobilnej (Flutter).  
Wspiera logowanie, rejestrację, zarządzanie profilem, śledzenie wyników oraz generowanie quizów z pomocą AI (Google Gemini).

## Funkcjonalności

- Rejestracja i logowanie użytkowników
- Tworzenie quizów (ręcznie lub z pomocą AI)
- Publiczne i prywatne quizy
- Rozwiązywanie quizów i zapisywanie wyników
- Edycja i usuwanie quizów oraz konta
- Przeglądanie quizów innych użytkowników
- Wersja mobilna na Androida (z obsługą odcisku palca)
- Obsługa wielu języków (PL/EN)
- Prosty, nowoczesny interfejs

## Prezentacja wyglądu wersji web

### Index page

<img width="500" src="https://github.com/azizko1337/quiz/blob/main/_assets/web/index.png?raw=true">

### Generowanie quizu przez Google Gemini

<img width="500" src="https://github.com/azizko1337/quiz/blob/main/_assets/web/createAi.png?raw=true">

### Edycja quizu

<img width="500" src="https://github.com/azizko1337/quiz/blob/main/_assets/web/edit.png?raw=true">

### Lista quizów

<img width="500" src="https://github.com/azizko1337/quiz/blob/main/_assets/web/quizzes.png?raw=true">

### Rozwiązywanie quizu

<img width="500" src="https://github.com/azizko1337/quiz/blob/main/_assets/web/attempt.png?raw=true">

### Podsumowanie rozwiązania

<img width="200" src="https://github.com/azizko1337/quiz/blob/main/_assets/web/summary.png?raw=true">

## Prezentacja wyglądu wersji mobile

### Logowanie

<img width="400" src="https://github.com/azizko1337/quiz/blob/main/_assets/mobile/login.jpeg?raw=true">

### Rozwiązywanie quizu

<img width="400" src="https://github.com/azizko1337/quiz/blob/main/_assets/mobile/attempt.jpeg?raw=true">

## Technologie

- **Frontend:** Vue 3, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Express, SQLite
- **AI:** Google Gemini API (generowanie pytań)
- **Mobile:** Flutter (Android)

## Struktura projektu

```
quiz/
├── backend/    # API, baza danych, obsługa AI
├── frontend/   # Aplikacja webowa (Vue)
├── flutter/    # Aplikacja mobilna (Flutter)
```

- Szczegółowe pliki konfiguracyjne i README w każdym podfolderze.

## Uruchamianie

### Backend

```sh
cd backend
npm install
npx tsx src/server.ts
```

### Frontend

```sh
cd frontend
npm install
npm run dev
```

Aplikacja będzie dostępna pod domyślnym adresem: [http://localhost:5173](http://localhost:5173)

### Mobile (Flutter)

```sh
cd flutter
flutter build apk
```

## Autor

Projekt wykonany przez [Antoniego Załupkę](https://azalupka.cc)  
na zaliczenie przedmiotów:  
**Projektowanie Webowych Aplikacji Graficznych** oraz **Projektowanie Aplikacji Mobilnych**.

---

> Aplikacja w pełni darmowa, kod źródłowy dostępny do wglądu.
