document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* =====================================================
       ELEMENTY
       ===================================================== */

    const pitch = document.getElementById("pitch");
    const bench = document.getElementById("bench");

    const createBtn = document.getElementById("createBtn");
    const saveBtn = document.getElementById("saveBtn");
    const exportPngBtn = document.getElementById("exportPngBtn");
    const exportPdfBtn = document.getElementById("exportPdfBtn");

    const formationSelect =
        document.getElementById("formationSelect");

    const matchName =
        document.getElementById("matchName");

    const matchDate =
        document.getElementById("matchDate");

    const editModal =
        document.getElementById("editModal");

    const playerNameInput =
        document.getElementById("playerNameInput");

    const confirmNameBtn =
        document.getElementById("confirmNameBtn");

    const cancelNameBtn =
        document.getElementById("cancelNameBtn");


    /* =====================================================
       KONTROLA
       ===================================================== */

    if (!pitch) {
        console.error("❌ Chybí #pitch");
        return;
    }

    if (!bench) {
        console.error("❌ Chybí #bench");
        return;
    }


    /* =====================================================
       KONSTANTY
       ===================================================== */

    const STORAGE_KEY =
        "match_lineup_data_v6";


    /* =====================================================
       STAV
       ===================================================== */

    let selectedPlayer = null;

    let editingElement = null;

    let draggingPlayer = null;

    let dragMoved = false;


    /* =====================================================
       HRÁČI
       ===================================================== */

    const players = [];

    for (let i = 1; i <= 16; i++) {

        players.push({
            number: i,
            name: "Hráč",
            captain: false
        });

    }


    /* =====================================================
       ROZESTAVENÍ
       ===================================================== */

    const formations = {

        "1-4-4-2": [

            {
                position: "GK",
                x: 50,
                y: 91
            },

            {
                position: "LB",
                x: 18,
                y: 73
            },

            {
                position: "CB",
                x: 40,
                y: 77
            },

            {
                position: "CB",
                x: 60,
                y: 77
            },

            {
                position: "RB",
                x: 82,
                y: 73
            },

            {
                position: "LM",
                x: 18,
                y: 53
            },

            {
                position: "CM",
                x: 40,
                y: 57
            },

            {
                position: "CM",
                x: 60,
                y: 57
            },

            {
                position: "RM",
                x: 82,
                y: 53
            },

            {
                position: "ST",
                x: 40,
                y: 29
            },

            {
                position: "ST",
                x: 60,
                y: 29
            }

        ],


        "1-4-3-3": [

            {
                position: "GK",
                x: 50,
                y: 91
            },

            {
                position: "LB",
                x: 18,
                y: 73
            },

            {
                position: "CB",
                x: 40,
                y: 77
            },

            {
                position: "CB",
                x: 60,
                y: 77
            },

            {
                position: "RB",
                x: 82,
                y: 73
            },

            {
                position: "CM",
                x: 28,
                y: 54
            },

            {
                position: "CM",
                x: 50,
                y: 51
            },

            {
                position: "CM",
                x: 72,
                y: 54
            },

            {
                position: "LW",
                x: 22,
                y: 28
            },

            {
                position: "ST",
                x: 50,
                y: 23
            },

            {
                position: "RW",
                x: 78,
                y: 28
            }

        ],


        "1-4-2-3-1": [

            {
                position: "GK",
                x: 50,
                y: 91
            },

            {
                position: "LB",
                x: 18,
                y: 73
            },

            {
                position: "CB",
                x: 40,
                y: 77
            },

            {
                position: "CB",
                x: 60,
                y: 77
            },

            {
                position: "RB",
                x: 82,
                y: 73
            },

            {
                position: "CM",
                x: 38,
                y: 58
            },

            {
                position: "CM",
                x: 62,
                y: 58
            },

            {
                position: "LW",
                x: 20,
                y: 38
            },

            {
                position: "CAM",
                x: 50,
                y: 35
            },

            {
                position: "RW",
                x: 80,
                y: 38
            },

            {
                position: "ST",
                x: 50,
                y: 20
            }

        ]

    };


    /* =====================================================
       POMOCNÉ FUNKCE
       ===================================================== */

    function getPlayer(number) {

        return players.find(
            player =>
                Number(player.number) === Number(number)
        );

    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function clearSelection() {

        document
            .querySelectorAll(
                ".player.selected, .bench-player.selected"
            )
            .forEach(element => {

                element.classList.remove("selected");

            });

        selectedPlayer = null;

    }


    /* =====================================================
       MODAL – OTEVŘENÍ EDITACE JMÉNA
       ===================================================== */

    function openNameModal(element) {

        if (!element || !editModal) {
            return;
        }

        editingElement = element;


        let currentName =
            element.dataset.name;


        if (!currentName) {

            const label =
                element.querySelector(
                    ".player-label, .bench-name"
                );

            if (label) {
                currentName =
                    label.textContent;
            }

        }


        playerNameInput.value =
            currentName === "Hráč"
                ? ""
                : currentName || "";


        editModal.style.display =
            "flex";


        setTimeout(() => {

            playerNameInput.focus();

            playerNameInput.select();

        }, 50);

    }


    /* =====================================================
       ZAVŘENÍ MODALU
       ===================================================== */

    function closeNameModal() {

        if (!editModal) {
            return;
        }

        editModal.style.display =
            "none";

        editingElement = null;

    }


    /* =====================================================
       ULOŽENÍ JMÉNA
       ===================================================== */

    function saveName() {

        if (!editingElement) {
            return;
        }


        let newName =
            playerNameInput.value.trim();


        if (!newName) {
            newName = "Hráč";
        }


        const number =
            Number(
                editingElement.dataset.number
            );


        const player =
            getPlayer(number);


        if (player) {

            player.name =
                newName;

        }


        editingElement.dataset.name =
            newName;


        const label =
            editingElement.querySelector(
                ".player-label, .bench-name"
            );


        if (label) {

            label.textContent =
                newName;

        }


        saveDataSilently();

        closeNameModal();

    }


    /* =====================================================
       MODAL – TLAČÍTKA
       ===================================================== */

    if (confirmNameBtn) {

        confirmNameBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                saveName();

            }
        );

    }


    if (cancelNameBtn) {

        cancelNameBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                closeNameModal();

            }
        );

    }


    if (editModal) {

        editModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    editModal
                ) {

                    closeNameModal();

                }

            }
        );

    }


    if (playerNameInput) {

        playerNameInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    saveName();

                }


                if (
                    event.key === "Escape"
                ) {

                    event.preventDefault();

                    closeNameModal();

                }

            }
        );

    }


    /* =====================================================
       VYTVOŘENÍ HRÁČE
       ===================================================== */

    function createPlayer(
        playerData,
        positionData
    ) {

        const player =
            document.createElement("div");


        player.className =
            "player";


        player.dataset.number =
            playerData.number;


        player.dataset.name =
            playerData.name;


        player.dataset.position =
            positionData.position;


        player.style.left =
            positionData.x + "%";


        player.style.top =
            positionData.y + "%";


        player.innerHTML = `

            <div class="player-number">
                ${escapeHTML(playerData.number)}
            </div>

            <div class="player-position">
                ${escapeHTML(positionData.position)}
            </div>

            <div class="player-label">
                ${escapeHTML(playerData.name)}
            </div>

        `;


        /* =================================================
           KAPITÁN
           ================================================= */

        if (playerData.captain) {

            addCaptainBadge(player);

        }


        const label =
            player.querySelector(
                ".player-label"
            );


        /* =================================================
           JMÉNO – DŮLEŽITÉ
           ================================================= */

        label.addEventListener(
            "pointerdown",
            function (event) {

                /*
                 * ZASTAVÍME DRAG.
                 */

                event.preventDefault();

                event.stopPropagation();

            }
        );


        label.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                clearSelection();

                openNameModal(player);

            }
        );


        label.addEventListener(
            "dblclick",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                openNameModal(player);

            }
        );


        /* =================================================
           KLIK NA HRÁČE
           ================================================= */

        player.addEventListener(
            "click",
            function (event) {

                /*
                 * Pokud byl klik na jméno,
                 * zde nic neděláme.
                 */

                if (
                    event.target.closest(
                        ".player-label"
                    )
                ) {

                    return;

                }


                /*
                 * Pokud se hráč posouval,
                 * není to klik pro střídání.
                 */

                if (dragMoved) {

                    return;

                }


                event.preventDefault();

                event.stopPropagation();


                clearSelection();


                selectedPlayer =
                    player;


                player.classList.add(
                    "selected"
                );

            }
        );


        /* =================================================
           PRAVÉ TLAČÍTKO = KAPITÁN
           ================================================= */

        player.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                setCaptain(player);

            }
        );


        /* =================================================
           POSOUVÁNÍ HRÁČE
           ================================================= */

        player.addEventListener(
            "pointerdown",
            function (event) {

                if (
                    event.target.closest(
                        ".player-label"
                    )
                ) {

                    return;

                }


                if (
                    event.button !== undefined &&
                    event.button !== 0
                ) {

                    return;

                }


                dragMoved = false;

                draggingPlayer =
                    player;


                try {

                    player.setPointerCapture(
                        event.pointerId
                    );

                } catch (error) {}


                const pitchRect =
                    pitch.getBoundingClientRect();


                function move(eventMove) {

                    if (
                        draggingPlayer !==
                        player
                    ) {

                        return;

                    }


                    const deltaX =
                        eventMove.clientX -
                        event.clientX;


                    const deltaY =
                        eventMove.clientY -
                        event.clientY;


                    if (
                        Math.abs(deltaX) > 4 ||
                        Math.abs(deltaY) > 4
                    ) {

                        dragMoved = true;

                    }


                    if (!dragMoved) {

                        return;

                    }


                    let x =
                        (
                            eventMove.clientX -
                            pitchRect.left
                        ) /
                        pitchRect.width *
                        100;


                    let y =
                        (
                            eventMove.clientY -
                            pitchRect.top
                        ) /
                        pitchRect.height *
                        100;


                    /*
                     * Hráč zůstane na hřišti.
                     */

                    x =
                        Math.max(
                            3,
                            Math.min(
                                97,
                                x
                            )
                        );


                    y =
                        Math.max(
                            4,
                            Math.min(
                                96,
                                y
                            )
                        );


                    player.style.left =
                        x + "%";


                    player.style.top =
                        y + "%";


                    eventMove.preventDefault();

                }


                function end() {

                    try {

                        player.releasePointerCapture(
                            event.pointerId
                        );

                    } catch (error) {}


                    player.removeEventListener(
                        "pointermove",
                        move
                    );


                    player.removeEventListener(
                        "pointerup",
                        end
                    );


                    player.removeEventListener(
                        "pointercancel",
                        end
                    );


                    draggingPlayer =
                        null;


                    if (dragMoved) {

                        saveDataSilently();

                    }


                    /*
                     * Po drag necháme click
                     * doběhnout bez výměny.
                     */

                    setTimeout(
                        function () {

                            dragMoved = false;

                        },
                        30
                    );

                }


                player.addEventListener(
                    "pointermove",
                    move
                );


                player.addEventListener(
                    "pointerup",
                    end
                );


                player.addEventListener(
                    "pointercancel",
                    end
                );

            }
        );


        return player;

    }


    /* =====================================================
       KAPITÁN
       ===================================================== */

    function addCaptainBadge(player) {

        if (
            player.querySelector(
                ".captain-badge"
            )
        ) {

            return;

        }


        const badge =
            document.createElement("span");


        badge.className =
            "captain-badge";


        badge.textContent =
            "C";


        badge.style.position =
            "absolute";


        badge.style.top =
            "-7px";


        badge.style.right =
            "-7px";


        badge.style.width =
            "20px";


        badge.style.height =
            "20px";


        badge.style.borderRadius =
            "50%";


        badge.style.background =
            "#ffd400";


        badge.style.color =
            "#000000";


        badge.style.fontWeight =
            "bold";


        badge.style.fontSize =
            "12px";


        badge.style.display =
            "flex";


        badge.style.alignItems =
            "center";


        badge.style.justifyContent =
            "center";


        badge.style.border =
            "2px solid #ffffff";


        badge.style.zIndex =
            "50";


        badge.style.pointerEvents =
            "none";


        player.appendChild(
            badge
        );

    }


    function setCaptain(player) {

        const number =
            Number(
                player.dataset.number
            );


        players.forEach(
            p => p.captain = false
        );


        const data =
            getPlayer(number);


        if (data) {

            data.captain =
                true;

        }


        document
            .querySelectorAll(
                ".captain-badge"
            )
            .forEach(
                badge => badge.remove()
            );


        addCaptainBadge(
            player
        );


        saveDataSilently();

    }


    /* =====================================================
       VYTVOŘENÍ LAVIČKY
       ===================================================== */

    function renderBench() {

        bench.innerHTML =
            "";


        for (
            let number = 12;
            number <= 16;
            number++
        ) {

            const playerData =
                getPlayer(number);


            if (!playerData) {

                continue;

            }


            const benchPlayer =
                document.createElement(
                    "div"
                );


            benchPlayer.className =
                "bench-player";


            benchPlayer.dataset.number =
                playerData.number;


            benchPlayer.dataset.name =
                playerData.name;


            benchPlayer.innerHTML = `

                <div class="bench-number">
                    ${escapeHTML(
                        playerData.number
                    )}
                </div>

                <div class="bench-name">
                    ${escapeHTML(
                        playerData.name
                    )}
                </div>

            `;


            const name =
                benchPlayer.querySelector(
                    ".bench-name"
                );


            /* =================================================
               JMÉNO NÁHRADNÍKA
               ================================================= */

            name.addEventListener(
                "pointerdown",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                }
            );


            name.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    clearSelection();

                    openNameModal(
                        benchPlayer
                    );

                }
            );


            name.addEventListener(
                "dblclick",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    openNameModal(
                        benchPlayer
                    );

                }
            );


            /* =================================================
               KLIK NA NÁHRADNÍKA
               ================================================= */

            benchPlayer.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target.closest(
                            ".bench-name"
                        )
                    ) {

                        return;

                    }


                    event.preventDefault();

                    event.stopPropagation();


                    /*
                     * Pokud je vybraný hráč
                     * na hřišti → střídání.
                     */

                    if (selectedPlayer) {

                        substitutePlayer(
                            selectedPlayer,
                            benchPlayer
                        );

                    }

                }
            );


            bench.appendChild(
                benchPlayer
            );

        }

    }


    /* =====================================================
       STŘÍDÁNÍ HRÁČ ↔ NÁHRADNÍK
       ===================================================== */

    function substitutePlayer(
        fieldPlayer,
        benchPlayer
    ) {

        if (
            !fieldPlayer ||
            !benchPlayer
        ) {

            return;

        }


        const fieldNumber =
            Number(
                fieldPlayer.dataset.number
            );


        const benchNumber =
            Number(
                benchPlayer.dataset.number
            );


        const fieldData =
            getPlayer(fieldNumber);


        const benchData =
            getPlayer(benchNumber);


        if (
            !fieldData ||
            !benchData
        ) {

            clearSelection();

            return;

        }


        /*
         * Uložíme pozici hráče na hřišti.
         */

        const left =
            fieldPlayer.style.left;


        const top =
            fieldPlayer.style.top;


        const position =
            fieldPlayer.dataset.position;


        /*
         * VYMĚNÍME ČÍSLO + JMÉNO + KAPITÁNA.
         */

        const temporary = {

            number:
                fieldData.number,

            name:
                fieldData.name,

            captain:
                fieldData.captain

        };


        fieldData.number =
            benchData.number;


        fieldData.name =
            benchData.name;


        fieldData.captain =
            benchData.captain;


        benchData.number =
            temporary.number;


        benchData.name =
            temporary.name;


        benchData.captain =
            temporary.captain;


        /*
         * Vykreslíme znovu hráče.
         */

        renderPitch(
            [
                {
                    number:
                        fieldData.number,

                    left:
                        left,

                    top:
                        top,

                    position:
                        position
                }
            ],
            true
        );


        /*
         * POZOR:
         * Ostatní hráče musíme zachovat.
         *
         * Proto místo kompletního přerenderování
         * provedeme bezpečnou obnovu.
         */

        const currentPositions =
            collectPositions();


        renderPitch(
            currentPositions
        );


        renderBench();


        clearSelection();


        saveDataSilently();

    }


    /* =====================================================
       SBĚR POZIC
       ===================================================== */

    function collectPositions() {

        const result = [];


        pitch
            .querySelectorAll(
                ".player"
            )
            .forEach(
                function (player) {

                    result.push({

                        number:
                            Number(
                                player.dataset.number
                            ),

                        left:
                            player.style.left,

                        top:
                            player.style.top,

                        position:
                            player.dataset.position

                    });

                }
            );


        return result;

    }


    /* =====================================================
       VYKRESLENÍ HŘIŠTĚ
       ===================================================== */

    function renderPitch(
        savedPositions = [],
        preserveCurrent = false
    ) {

        const formation =
            formations[
                formationSelect.value
            ] ||
            formations["1-4-4-2"];


        let positions =
            savedPositions;


        if (
            preserveCurrent &&
            !positions.length
        ) {

            positions =
                collectPositions();

        }


        pitch
            .querySelectorAll(
                ".player"
            )
            .forEach(
                player => player.remove()
            );


        formation.forEach(
            function (
                positionData,
                index
            ) {

                /*
                 * V základní sestavě jsou 1–11.
                 */

                const playerData =
                    getPlayer(
                        index + 1
                    );


                if (!playerData) {

                    return;

                }


                const saved =
                    positions.find(
                        item =>
                            Number(
                                item.number
                            ) ===
                            Number(
                                playerData.number
                            )
                    );


                const finalPosition = {

                    position:
                        saved?.position ||
                        positionData.position,

                    x:
                        saved
                            ? parseFloat(
                                saved.left
                            )
                            : positionData.x,

                    y:
                        saved
                            ? parseFloat(
                                saved.top
                            )
                            : positionData.y

                };


                const element =
                    createPlayer(
                        playerData,
                        finalPosition
                    );


                pitch.appendChild(
                    element
                );

            }
        );

    }


    /* =====================================================
       VYTVOŘIT SESTAVU
       ===================================================== */

    if (createBtn) {

        createBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                clearSelection();

                renderPitch();

                renderBench();

                saveDataSilently();

            }
        );

    }


    /* =====================================================
       ZMĚNA ROZESTAVENÍ
       ===================================================== */

    if (formationSelect) {

        formationSelect.addEventListener(
            "change",
            function () {

                clearSelection();

                renderPitch();

                renderBench();

                saveDataSilently();

            }
        );

    }


    /* =====================================================
       ULOŽENÍ DAT
       ===================================================== */

    function buildData() {

        return {

            players:
                players,

            formation:
                formationSelect
                    ? formationSelect.value
                    : "1-4-4-2",

            matchName:
                matchName
                    ? matchName.value
                    : "",

            matchDate:
                matchDate
                    ? matchDate.value
                    : "",

            positions:
                collectPositions()

        };

    }


    function saveDataSilently() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    buildData()
                )
            );

        } catch (error) {

            console.error(
                "❌ Chyba ukládání:",
                error
            );

        }

    }


    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                saveDataSilently();


                const oldText =
                    saveBtn.textContent;


                saveBtn.textContent =
                    "✅ Uloženo";


                setTimeout(
                    function () {

                        saveBtn.textContent =
                            oldText;

                    },
                    1200
                );

            }
        );

    }


    /* =====================================================
       NAČTENÍ DAT
       ===================================================== */

    function loadData() {

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!saved) {

                renderPitch();

                renderBench();

                return;

            }


            const data =
                JSON.parse(
                    saved
                );


            if (
                Array.isArray(
                    data.players
                )
            ) {

                data.players.forEach(
                    function (
                        savedPlayer
                    ) {

                        const player =
                            getPlayer(
                                savedPlayer.number
                            );


                        if (!player) {

                            return;

                        }


                        player.name =
                            savedPlayer.name ||
                            "Hráč";


                        player.captain =
                            Boolean(
                                savedPlayer.captain
                            );

                    }
                );

            }


            if (
                formationSelect &&
                data.formation &&
                formations[
                    data.formation
                ]
            ) {

                formationSelect.value =
                    data.formation;

            }


            if (matchName) {

                matchName.value =
                    data.matchName ||
                    "";

            }


            if (matchDate) {

                matchDate.value =
                    data.matchDate ||
                    "";

            }


            renderPitch(
                Array.isArray(
                    data.positions
                )
                    ? data.positions
                    : []
            );


            renderBench();

        } catch (error) {

            console.error(
                "❌ Chyba načítání:",
                error
            );


            renderPitch();

            renderBench();

        }

    }


    /* =====================================================
       AUTOMATICKÉ ULOŽENÍ NÁZVU A DATA
       ===================================================== */

    if (matchName) {

        matchName.addEventListener(
            "input",
            saveDataSilently
        );

    }


    if (matchDate) {

        matchDate.addEventListener(
            "change",
            saveDataSilently
        );

    }


    /* =====================================================
       PNG
       ===================================================== */

    if (exportPngBtn) {

        exportPngBtn.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();


                if (
                    typeof html2canvas ===
                    "undefined"
                ) {

                    alert(
                        "❌ html2canvas není načten."
                    );

                    return;

                }


                const element =
                    document.getElementById(
                        "lineupExport"
                    );


                if (!element) {

                    return;

                }


                try {

                    const canvas =
                        await html2canvas(
                            element,
                            {

                                backgroundColor:
                                    "#164d20",

                                scale: 2,

                                useCORS: true,

                                logging: false

                            }
                        );


                    const link =
                        document.createElement(
                            "a"
                        );


                    link.download =
                        "match-lineup.png";


                    link.href =
                        canvas.toDataURL(
                            "image/png"
                        );


                    document.body.appendChild(
                        link
                    );


                    link.click();


                    link.remove();

                } catch (error) {

                    console.error(
                        "PNG:",
                        error
                    );


                    alert(
                        "❌ PNG se nepodařilo vytvořit."
                    );

                }

            }
        );

    }


    /* =====================================================
       PDF
       ===================================================== */

    if (exportPdfBtn) {

        exportPdfBtn.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();


                if (
                    typeof html2canvas ===
                    "undefined"
                ) {

                    alert(
                        "❌ html2canvas není načten."
                    );

                    return;

                }


                if (
                    !window.jspdf ||
                    !window.jspdf.jsPDF
                ) {

                    alert(
                        "❌ jsPDF není načten."
                    );

                    return;

                }


                const element =
                    document.getElementById(
                        "lineupExport"
                    );


                if (!element) {

                    return;

                }


                try {

                    const canvas =
                        await html2canvas(
                            element,
                            {

                                backgroundColor:
                                    "#164d20",

                                scale: 2,

                                useCORS: true,

                                logging: false

                            }
                        );


                    const image =
                        canvas.toDataURL(
                            "image/png"
                        );


                    const jsPDF =
                        window.jspdf.jsPDF;


                    const pdf =
                        new jsPDF(
                            "landscape",
                            "mm",
                            "a4"
                        );


                    const pageWidth =
                        pdf.internal.pageSize
                            .getWidth();


                    const pageHeight =
                        pdf.internal.pageSize
                            .getHeight();


                    const margin = 8;


                    const availableWidth =
                        pageWidth -
                        margin * 2;


                    const ratio =
                        canvas.height /
                        canvas.width;


                    let imageWidth =
                        availableWidth;


                    let imageHeight =
                        imageWidth *
                        ratio;


                    if (
                        imageHeight >
                        pageHeight -
                        margin * 2
                    ) {

                        imageHeight =
                            pageHeight -
                            margin * 2;


                        imageWidth =
                            imageHeight /
                            ratio;

                    }


                    const x =
                        (
                            pageWidth -
                            imageWidth
                        ) / 2;


                    const y =
                        (
                            pageHeight -
                            imageHeight
                        ) / 2;


                    pdf.addImage(
                        image,
                        "PNG",
                        x,
                        y,
                        imageWidth,
                        imageHeight
                    );


                    pdf.save(
                        "match-lineup.pdf"
                    );

                } catch (error) {

                    console.error(
                        "PDF:",
                        error
                    );


                    alert(
                        "❌ PDF se nepodařilo vytvořit."
                    );

                }

            }
        );

    }


    /* =====================================================
       START
       ===================================================== */

    loadData();


    console.log(
        "✅ Match LineUP – lineup.js načten."
    );

});
