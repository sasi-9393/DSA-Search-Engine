const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const resultsCon = document.getElementById("results");
const spinner = document.getElementById("spinner");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const inp = input.value.trim();
    if (!inp) return;
    resultsCon.innerHTML = "";
    spinner.classList.remove("hidden");

    // fetch and get the things
    try {
        const response = await fetch("http://localhost:8000/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: inp })
        });
        if (!response.ok) throw new Error("Server Error");
        const { results } = await response.json();
        spinner.classList.add("hidden");
        if (results.length === 0) {
            resultsCon.innerHTML = "<p>No Matches Found</p>";
            return;
        }
        // have result and index and for first index we make it featured style
        resultsCon.innerHTML = results.map((r, i) => {
            return `
            <div class="card ${i === 0 ? "featured" : ""}"> 
                <div class="card-header">
                    <img src="assets/logos/${r.platform.toLowerCase()}.png" alt="${r.platform}" class="platform-logo" />
                    <a href="${r.url}" target="_blank" class="card-title">[${r.platform}] ${r.title}</a>
                </div>
            </div>`;
        }).join("");

    }
    catch (err) {
        console.log("error occured", err);
    }

})
