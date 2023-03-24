type ValueOf<T> = T[keyof T];

export type Languages = {
    cobol: "COBOL"
    cplusplus: "C++"
    csharp: "C#"
    css: "CSS"
    docker: "Docker"
    fsharp: "F#"
    go: "Go"
    java: "Java"
    js: "JavaScript"
    kotlin: "Kotlin"
    perl: "Perl"
    php: "PHP"
    powershell: "Powershell"
    python: "Python"
    rust: "Rust"
    sql: "SQL"
    swift: "Swift"
    ts: "TypeScript"
    vba: "VBA"
}

export type LanguageKeys = ValueOf<keyof Languages>