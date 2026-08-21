document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /* =================================================
       HTML ELEMENTY
       ================================================= */

    const pitch =
        document.getElementById("pitch");

    const bench =
        document.getElementById("bench");

    const formationSelect =
        document.getElementById("formationSelect");

    const createBtn =
        document.getElementById("createBtn");

    const saveBtn =
        document.getElementById("saveBtn");

    const exportPngBtn =
        document.getElementById("exportPngBtn");

    const exportPdfBtn =
        document.getElementById("exportPdfBtn");

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

    const exportContainer =
        document.getElementById("lineupExport");


    /* =================================================
       KONTROLA
       ================================================= */

    if (!pitch) {
        console.error("Chybí #pitch");
        return;
    }

    if (!bench) {
        console.error("Chybí #bench");
        return;
    }

    if (!formationSelect) {
        console.error("Chybí #formationSelect");
        return;
    }

    if (!createBtn) {
        console.error("Chybí #createBtn");
        return;
    }


    /* =================================================
       STAV
       ================================================= */

    let selectedForSwap = null;

    let selectedForEdit = null;

    let isDragging = false;


    /* =================================================
       ROZESTAVENÍ
       ================================================= */

    const formations = {

        "1-4-4-2": [
            ["GK"],
            ["LB", "CB", "CB", "RB"],
            ["LM", "CM", "CM", "RM"],
            ["ST", "ST"]
        ],

        "1-4-3-3": [
            ["GK"],
            ["LB", "CB", "CB", "RB"],
            ["CM", "CM", "CM"],
            ["LW", "ST", "RW"]
        ],

        "1-4-2-3-1": [
            ["GK"],
            ["LB", "CB", "CB", "RB"],
            ["CDM", "CDM"],
            ["LW", "CAM", "RW"],
            ["ST"]
        ]

    };


    /* =================================================
       POZICE HRÁČŮ
       ================================================= */

    function getPositions(formation) {

        return formations[formation]
            || formations["1-4-4-2"];

    }


    /* =================================================
       ZRUŠENÍ VÝBĚRU
       ================================================= */

    function clearSelection() {

        if (selectedForSwap) {

            selectedForSwap.classList.remove("selected");

        }

        document
            .querySelectorAll(".bench-player.selected")
            .forEach(function (el) {

                el.classList.remove("selected");

            });


        selectedForSwap = null;

    }


    /* =================================================
       EDITACE JMÉNA
       ================================================= */

    function openNameEditor(element) {

        if (!element) {
            return;
        }

        selectedForEdit = element;

        let name = "";


        if (
            element.classList.contains("player")
        ) {

            const label =
                element.querySelector(".player-label");

            if (label) {
                name = label.textContent;
            }

        }


        if (
            element.classList.contains("bench-player")
        ) {

            const label =
                element.querySelector(".bench-name");

            if (label) {
                name = label.textContent;
            }

        }


        playerNameInput.value =
            name || "Hráč";


        editModal.style.display = "flex";


        setTimeout(function () {

            playerNameInput.focus();

            playerNameInput.select();

        }, 50);

    }


    /* =================================================
       POTVRZENÍ JMÉNA
       ================================================= */

    if (confirmNameBtn) {

        confirmNameBtn.addEventListener(
            "click",
            function () {

                if (!selectedForEdit) {
                    return;
                }


                const newName =
                    playerNameInput.value.trim()
                    || "Hráč";


                /* HRÁČ */

                if (
                    selectedForEdit.classList.contains("player")
                ) {

                    const label =
                        selectedForEdit
                            .querySelector(".player-label");

                    if (label) {
                        label.textContent = newName;
                    }

                }


                /* NÁHRADNÍK */

                if (
                    selectedForEdit.classList.contains(
                        "bench-player"
                    )
                ) {

                    const label =
                        selectedForEdit
                            .querySelector(".bench-name");

                    if (label) {
                        label.textContent = newName;
                    }

                }


                closeNameEditor();

            }
        );

    }


    /* =================================================
       ZRUŠENÍ EDITACE
       ================================================= */

    function closeNameEditor() {

        editModal.style.display = "none";

        playerNameInput.value = "";

        selectedForEdit = null;

    }


    if (cancelNameBtn) {

        cancelNameBtn.addEventListener(
            "click",
            function () {

                closeNameEditor();

            }
        );

    }


    /* =================================================
       ESC – ZAVŘENÍ MODALU
       ================================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                editModal.style.display === "flex"
            ) {

                closeNameEditor();

            }

        }
    );


    /* =================================================
       VÝMĚNA DVOU HRÁČŮ
       ================================================= */

    function swapFieldPlayers(
        playerA,
        playerB
    ) {

        if (!playerA || !playerB) {
            return;
        }


        const numberA =
            playerA.querySelector(".player-number");

        const numberB =
            playerB.querySelector(".player-number");


        const nameA =
            playerA.querySelector(".player-label");

        const nameB =
            playerB.querySelector(".player-label");


        const positionA =
            playerA.querySelector(".player-position");

        const positionB =
            playerB.querySelector(".player-position");


        if (numberA && numberB) {

            const temp =
                numberA.textContent;

            numberA.textContent =
                numberB.textContent;

            numberB.textContent =
                temp;

        }


        if (nameA && nameB) {

            const temp =
                nameA.textContent;

            nameA.textContent =
                nameB.textContent;

            nameB.textContent =
                temp;

        }


        /*
         * Pozice zůstává na místě.
         *
         * Proto NEVYMĚŇUJEME positionA/B.
         */

    }


    /* =================================================
       VÝMĚNA HRÁČ ↔ NÁHRADNÍK
       ================================================= */

    function swapWithBench(
        fieldPlayer,
        benchPlayer
    ) {

        if (!fieldPlayer || !benchPlayer) {
            return;
        }


        const fieldNumber =
            fieldPlayer.querySelector(
                ".player-number"
            );

        const fieldName =
            fieldPlayer.querySelector(
                ".player-label"
            );


        const benchNumber =
            benchPlayer.querySelector(
                ".bench-number"
            );

        const benchName =
            benchPlayer.querySelector(
                ".bench-name"
            );


        if (
            !fieldNumber ||
            !fieldName ||
            !benchNumber ||
            !benchName
        ) {
            return;
        }


        /* ČÍSLO */

        const tempNumber =
            fieldNumber.textContent;

        fieldNumber.textContent =
            benchNumber.textContent;

        benchNumber.textContent =
            tempNumber;


        /* JMÉNO */

        const tempName =
            fieldName.textContent;

        fieldName.textContent =
            benchName.textContent;

        benchName.textContent =
            tempName;

    }


    /* =================================================
       VÝBĚR HRÁČE
       ================================================= */

    function selectFieldPlayer(player) {

        if (!selectedForSwap) {

            selectedForSwap = player;

            player.classList.add("selected");

            return;

        }


        if (
            selectedForSwap === player
        ) {

            clearSelection();

            return;

        }


        if (
            selectedForSwap.classList.contains("player")
        ) {

            swapFieldPlayers(
                selectedForSwap,
                player
            );

        }


        clearSelection();

    }


    /* =================================================
       VYTVOŘENÍ HRÁČE
       ================================================= */

    function createPlayer(
        number,
        position,
        isGK
    ) {

        const player =
            document.createElement("div");


        player.className = "player";


        /* ČÍSLO */

        const numberEl =
            document.createElement("div");

        numberEl.className =
            "player-number";

        numberEl.textContent =
            isGK ? "GK" : number;


        player.appendChild(numberEl);


        /* POZICE */

        const positionEl =
            document.createElement("div");

        positionEl.className =
            "player-position";

        positionEl.textContent =
            position || "";


        player.appendChild(positionEl);


        /* JMÉNO */

        const nameEl =
            document.createElement("div");

        nameEl.className =
            "player-label";

        nameEl.textContent =
            "Hráč";


        player.appendChild(nameEl);


        /* =================================================
           KLIK NA JMÉNO
           ================================================= */

        nameEl.addEventListener(
            "pointerdown",
            function (event) {

                event.stopPropagation();

                /*
                 * Zabráníme zahájení drag
                 * při kliknutí na jméno.
                 */

                openNameEditor(player);

            }
        );


        /* =================================================
           KLIK NA HRÁČE
           ================================================= */

        player.addEventListener(
            "click",
            function (event) {

                /*
                 * Pokud se právě táhlo,
                 * click ignorujeme.
                 */

                if (isDragging) {
                    return;
                }


                /*
                 * Klik na jméno
                 * neřešíme jako výměnu.
                 */

                if (
                    event.target.classList.contains(
                        "player-label"
                    )
                ) {

                    return;

                }


                selectFieldPlayer(player);

            }
        );


        /* =================================================
           DRAG – POINTER
           ================================================= */

        let dragStartX = 0;

        let dragStartY = 0;

        let startLeft = 0;

        let startTop = 0;


        player.addEventListener(
            "pointerdown",
            function (event) {

                /*
                 * Klik na jméno
                 * není drag.
                 */

                if (
                    event.target.classList.contains(
                        "player-label"
                    )
                ) {

                    return;

                }


                const rect =
                    player.getBoundingClientRect();


                const pitchRect =
                    pitch.getBoundingClientRect();


                dragStartX =
                    event.clientX;

                dragStartY =
                    event.clientY;


                startLeft =
                    parseFloat(
                        player.style.left
                    ) || 50;


                startTop =
                    parseFloat(
                        player.style.top
                    ) || 50;


                isDragging = false;


                try {

                    player.setPointerCapture(
                        event.pointerId
                    );

                } catch (error) {
                    /* není kritické */
                }

            }
        );


        player.addEventListener(
            "pointermove",
            function (event) {

                /*
                 * Pokud není tlačítko/prst
                 * aktivní, nic nedělej.
                 */

                if (
                    event.buttons === 0
                ) {

                    return;

                }


                const pitchRect =
                    pitch.getBoundingClientRect();


                const deltaX =
                    event.clientX -
                    dragStartX;


                const deltaY =
                    event.clientY -
                    dragStartY;


                /*
                 * Až po malém pohybu
                 * považujeme akci za drag.
                 */

                if (
                    Math.abs(deltaX) > 3 ||
                    Math.abs(deltaY) > 3
                ) {

                    isDragging = true;

                }


                if (!isDragging) {
                    return;
                }


                const deltaPercentX =
                    (
                        deltaX /
                        pitchRect.width
                    ) * 100;


                const deltaPercentY =
                    (
                        deltaY /
                        pitchRect.height
                    ) * 100;


                let newLeft =
                    startLeft +
                    deltaPercentX;


                let newTop =
                    startTop +
                    deltaPercentY;


                /*
                 * Hráč zůstane uvnitř hřiště.
                 */

                const marginX =
                    (
                        player.offsetWidth /
                        pitchRect.width
                    ) * 50;


                const marginY =
                    (
                        player.offsetHeight /
                        pitchRect.height
                    ) * 50;


                newLeft =
                    Math.max(
                        marginX,
                        Math.min(
                            100 - marginX,
                            newLeft
                        )
                    );


                newTop =
                    Math.max(
                        marginY,
                        Math.min(
                            100 - marginY,
                            newTop
                        )
                    );


                player.style.left =
                    newLeft + "%";


                player.style.top =
                    newTop + "%";


                event.preventDefault();

            }
        );


        player.addEventListener(
            "pointerup",
            function (event) {

                try {

                    player.releasePointerCapture(
                        event.pointerId
                    );

                } catch (error) {
                    /* není kritické */
                }

            }
        );


        player.addEventListener(
            "pointercancel",
            function () {

                isDragging = false;

            }
        );


        return player;

    }


    /* =================================================
       VYTVOŘENÍ NÁHRADNÍKA
       ================================================= */

    function createBenchPlayer(number) {

        const benchPlayer =
            document.createElement("div");


        benchPlayer.className =
            "bench-player";


        /* ČÍSLO */

        const numberEl =
            document.createElement("div");

        numberEl.className =
            "bench-number";

        numberEl.textContent =
            number;


        benchPlayer.appendChild(
            numberEl
        );


        /* JMÉNO */

        const nameEl =
            document.createElement("div");

        nameEl.className =
            "bench-name";

        nameEl.textContent =
            "Hráč";


        benchPlayer.appendChild(
            nameEl
        );


        /* =================================================
           EDITACE JMÉNA
           ================================================= */

        nameEl.addEventListener(
            "pointerdown",
            function (event) {

                event.stopPropagation();

                openNameEditor(
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

                event.stopPropagation();


                if (!selectedForSwap) {

                    selectedForSwap =
                        benchPlayer;

                    benchPlayer.classList.add(
                        "selected"
                    );

                    return;

                }


                if (
                    selectedForSwap ===
                    benchPlayer
                ) {

                    clearSelection();

                    return;

                }


                /*
                 * Výměna pouze pokud je
                 * vybraný hráč na hřišti.
                 */

                if (
                    selectedForSwap.classList.contains(
                        "player"
                    )
                ) {

                    swapWithBench(
                        selectedForSwap,
                        benchPlayer
                    );

                }


                clearSelection();

            }
        );


        return benchPlayer;

    }


    /* =================================================
       VYTVOŘENÍ SESTAVY
       ================================================= */

    createBtn.addEventListener(
        "click",
        function () {

            /*
             * Vyčistíme pouze hráče
             * a lavičku.
             *
             * Čáry hřiště zůstanou.
             */

            pitch
                .querySelectorAll(".player")
                .forEach(function (player) {

                    player.remove();

                });


            bench.innerHTML = "";


            clearSelection();


            const formation =
                formationSelect.value;


            const rows =
                getPositions(formation);


            /*
             * Čísla:
             *
             * GK
             * 2–11
             */

            let jerseyNumber = 2;


            const rowCount =
                rows.length;


            rows.forEach(
                function (
                    row,
                    rowIndex
                ) {

                    const playerCount =
                        row.length;


                    /*
                     * Pozice jednotlivých řad.
                     */

                    const y =
                        8 +
                        (
                            rowIndex /
                            Math.max(
                                rowCount - 1,
                                1
                            )
                        ) * 84;


                    row.forEach(
                        function (
                            position,
                            playerIndex
                        ) {

                            const isGK =
                                rowIndex === 0 &&
                                position === "GK";


                            let player;


                            if (isGK) {

                                player =
                                    createPlayer(
                                        null,
                                        "GK",
                                        true
                                    );

                            } else {

                                player =
                                    createPlayer(
                                        jerseyNumber,
                                        position,
                                        false
                                    );


                                jerseyNumber++;

                            }


                            /*
                             * X pozice
                             */

                            let x;


                            if (
                                playerCount === 1
                            ) {

                                x = 50;

                            } else {

                                x =
                                    (
                                        (
                                            playerIndex + 1
                                        ) /
                                        (
                                            playerCount + 1
                                        )
                                    ) * 100;

                            }


                            player.style.left =
                                x + "%";


                            player.style.top =
                                y + "%";


                            pitch.appendChild(
                                player
                            );

                        }
                    );

                }
            );


            /*
             * LAVIČKA
             *
             * Pokud máme 11 hráčů,
             * jerseyNumber bude 12.
             */

            for (
                let number = jerseyNumber;
                number <= 16;
                number++
            ) {

                const benchPlayer =
                    createBenchPlayer(
                        number
                    );


                bench.appendChild(
                    benchPlayer
                );

            }

        }
    );


    /* =================================================
       ULOŽENÍ
       ================================================= */

    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            function () {

                const data = {

                    matchName:
                        matchName
                            ? matchName.value
                            : "",

                    matchDate:
                        matchDate
                            ? matchDate.value
                            : "",

                    formation:
                        formationSelect.value,

                    players: [],

                    bench: []

                };


                /*
                 * HRÁČI
                 */

                pitch
                    .querySelectorAll(".player")
                    .forEach(
                        function (player) {

                            data.players.push({

                                number:
                                    player
                                        .querySelector(
                                            ".player-number"
                                        )
                                        .textContent,

                                position:
                                    player
                                        .querySelector(
                                            ".player-position"
                                        )
                                        .textContent,

                                name:
                                    player
                                        .querySelector(
                                            ".player-label"
                                        )
                                        .textContent,

                                left:
                                    player.style.left,

                                top:
                                    player.style.top

                            });

                        }
                    );


                /*
                 * LAVIČKA
                 */

                bench
                    .querySelectorAll(
                        ".bench-player"
                    )
                    .forEach(
                        function (player) {

                            data.bench.push({

                                number:
                                    player
                                        .querySelector(
                                            ".bench-number"
                                        )
                                        .textContent,

                                name:
                                    player
                                        .querySelector(
                                            ".bench-name"
                                        )
                                        .textContent

                            });

                        }
                    );


                try {

                    localStorage.setItem(
                        "MATCH_LINEUP_DATA",
                        JSON.stringify(data)
                    );


                    alert(
                        "✅ Sestava byla uložena."
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        "❌ Sestavu se nepodařilo uložit."
                    );

                }

            }
        );

    }


    /* =================================================
       NAČTENÍ ULOŽENÉ SESTAVY
       ================================================= */

    function loadSavedLineup() {

        const saved =
            localStorage.getItem(
                "MATCH_LINEUP_DATA"
            );


        if (!saved) {
            return;
        }


        try {

            const data =
                JSON.parse(saved);


            if (
                matchName &&
                data.matchName
            ) {

                matchName.value =
                    data.matchName;

            }


            if (
                matchDate &&
                data.matchDate
            ) {

                matchDate.value =
                    data.matchDate;

            }


            if (data.formation) {

                formationSelect.value =
                    data.formation;

            }


            /*
             * Hráče vytvoříme
             * podle uložených dat.
             */

            data.players.forEach(
                function (item) {

                    const player =
                        createPlayer(
                            item.number === "GK"
                                ? null
                                : item.number,

                            item.position,

                            item.number === "GK"
                        );


                    player
                        .querySelector(
                            ".player-label"
                        )
                        .textContent =
                        item.name || "Hráč";


                    player.style.left =
                        item.left || "50%";


                    player.style.top =
                        item.top || "50%";


                    pitch.appendChild(
                        player
                    );

                }
            );


            /*
             * Lavička
             */

            data.bench.forEach(
                function (item) {

                    const player =
                        createBenchPlayer(
                            item.number
                        );


                    player
                        .querySelector(
                            ".bench-name"
                        )
                        .textContent =
                        item.name || "Hráč";


                    bench.appendChild(
                        player
                    );

                }
            );


        } catch (error) {

            console.error(
                "Chyba načítání sestavy:",
                error
            );

        }

    }


    /* =================================================
       EXPORT – PŘÍPRAVA
       ================================================= */

    async function createExportCanvas() {

        if (
            typeof html2canvas ===
            "undefined"
        ) {

            throw new Error(
                "html2canvas není načten."
            );

        }


        /*
         * html2canvas někdy neumí správně
         * zachytit zelené pozadí v kombinaci
         * s některými CSS styly.
         *
         * Proto exportnímu kontejneru
         * nastavíme pevné pozadí.
         */

        const oldBackground =
            exportContainer.style.background;


        exportContainer.style.background =
            "#164d20";


        try {

            const canvas =
                await html2canvas(
                    exportContainer,
                    {
                        backgroundColor:
                            "#164d20",

                        scale: 2,

                        useCORS: true,

                        logging: false
                    }
                );


            return canvas;

        } finally {

            exportContainer.style.background =
                oldBackground;

        }

    }


    /* =================================================
       EXPORT PNG
       ================================================= */

    if (exportPngBtn) {

        exportPngBtn.addEventListener(
            "click",
            async function () {

                try {

                    const canvas =
                        await createExportCanvas();


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
                        "PNG export:",
                        error
                    );


                    alert(
                        "❌ Export PNG se nepodařil."
                    );

                }

            }
        );

    }


    /* =================================================
       EXPORT PDF
       ================================================= */

    if (exportPdfBtn) {

        exportPdfBtn.addEventListener(
            "click",
            async function () {

                try {

                    if (
                        typeof html2canvas ===
                        "undefined"
                    ) {

                        throw new Error(
                            "html2canvas není načten."
                        );

                    }


                    if (
                        !window.jspdf ||
                        !window.jspdf.jsPDF
                    ) {

                        throw new Error(
                            "jsPDF není načten."
                        );

                    }


                    const canvas =
                        await createExportCanvas();


                    const imgData =
                        canvas.toDataURL(
                            "image/png"
                        );


                    const jsPDF =
                        window.jspdf.jsPDF;


                    const pdf =
                        new jsPDF(
                            "portrait",
                            "mm",
                            "a4"
                        );


                    const pageWidth =
                        pdf.internal.pageSize.getWidth();


                    const pageHeight =
                        pdf.internal.pageSize.getHeight();


                    const margin =
                        8;


                    const availableWidth =
                        pageWidth -
                        margin * 2;


                    const imageRatio =
                        canvas.height /
                        canvas.width;


                    let imageWidth =
                        availableWidth;


                    let imageHeight =
                        imageWidth *
                        imageRatio;


                    /*
                     * Pokud je obrázek příliš vysoký,
                     * zmenšíme ho.
                     */

                    const maxHeight =
                        pageHeight -
                        margin * 2;


                    if (
                        imageHeight >
                        maxHeight
                    ) {

                        imageHeight =
                            maxHeight;


                        imageWidth =
                            imageHeight /
                            imageRatio;

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


                    /*
                     * Název zápasu
                     */

                    const title =
                        matchName &&
                        matchName.value.trim()
                            ? matchName.value.trim()
                            : "Match LineUP";


                    pdf.setFontSize(16);


                    pdf.text(
                        title,
                        pageWidth / 2,
                        6,
                        {
                            align: "center"
                        }
                    );


                    /*
                     * Obrázek
                     */

                    pdf.addImage(
                        imgData,
                        "PNG",
                        x,
                        Math.max(
                            y,
                            12
                        ),
                        imageWidth,
                        Math.min(
                            imageHeight,
                            pageHeight - 18
                        )
                    );


                    /*
                     * Datum
                     */

                    if (
                        matchDate &&
                        matchDate.value
                    ) {

                        pdf.setFontSize(9);


                        const date =
                            new Date(
                                matchDate.value +
                                "T00:00:00"
                            );


                        const formatted =
                            date.toLocaleDateString(
                                "cs-CZ"
                            );


                        pdf.text(
                            "Datum: " +
                            formatted,
                            pageWidth / 2,
                            pageHeight - 4,
                            {
                                align:
                                    "center"
                            }
                        );

                    }


                    pdf.save(
                        "match-lineup.pdf"
                    );


                } catch (error) {

                    console.error(
                        "PDF export:",
                        error
                    );


                    alert(
                        "❌ Export PDF se nepodařil.\n\n" +
                        error.message
                    );

                }

            }
        );

    }


    /* =================================================
       KLIK MIMO HRÁČE
       ================================================= */

    pitch.addEventListener(
        "click",
        function (event) {

            if (
                event.target === pitch
            ) {

                clearSelection();

            }

        }
    );


    /* =================================================
       ZAVŘENÍ MODALU KLIKEM MIMO
       ================================================= */

    if (editModal) {

        editModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    editModal
                ) {

                    closeNameEditor();

                }

            }
        );

    }


    /* =================================================
       AUTOMATICKÉ NAČTENÍ
       ================================================= */

    loadSavedLineup();


    console.log(
        "✅ Match LineUP JS načten."
    );

});
