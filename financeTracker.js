export default class financeTracker {
    constructor(querySelectorString){
        this.root = document.querySelector(querySelectorString);
        this.root.innerHTML = financeTracker.html();
        this.root.querySelector(".new").addEventListener("click", () => {
            this.onNewEntryBtnClick();
        });
        this.load();
    }

    static html() {
        return `
            <table class="tracker">
                <thead>
                    <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Income/Outgoing</th>
                    <th>Amount</th>
                    </tr>
                </thead>
                <tbody class="entry">
                </tbody>
                <tbody>
                    <tr>
                        <td colspan="5" class="add_entry">
                            <button type="button" class="new">New Entry</button>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" class="summary">
                            <p>Total:</p>
                            <span class="total">£0.00</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;
    }

    static entryHtml() {
        return`
            <tr>
                <td>
                    <input class="input input-date" type="date">
                </td>
                <td>
                    <input class="input input-description" type="text" placeholder="Please describe the income or expense">
                </td>
                <td>
                    <select class="input input-type">
                        <option value="income">Income</option>
                        <option value="outgoing">Outgoing</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="input input-amount">
                </td>
                <td>
                    <button type="button" class="remove">&#128465;</button>
                </td>
            </tr>
        `;
    }

    load() {
        const entires = JSON.parse(localStorage.getItem("finance-tracker-entries") || "[]");
        for (const entry of entires) {
            this.addEntry(entry);
        }
        this.updateSummary();
    }

    updateSummary() {
        const total = this.getEntryRows().reduce((total, row) => {
            const amount = row.querySelector(".input-amount").value;
            const isExpense = row.querySelector(".input-type").value === "outgoing";
            const modifier = isExpense ? -1 : 1;
            return total + (amount * modifier);
        }, 0);

        const totalFormatted = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP"
        }).format(total);

        this.root.querySelector(".total").textContent = totalFormatted;
    }

    save() {
        const data = this.getEntryRows().map(row => {
            return {
                date: row.querySelector(".input-date").value,
                description: row.querySelector(".input-description").value,
                type: row.querySelector(".input-type").value,
                amount: parseFloat(row.querySelector(".input-amount").value),
            };
        });

        localStorage.setItem("finance-tracker-entries", JSON.stringify(data));
        this.updateSummary();
    }

    addEntry(entries = {}){
            this.root.querySelector(".entry").insertAdjacentHTML("beforeend", financeTracker.entryHtml());
            const row = this.root.querySelector(".entry tr:last-of-type");

            row.querySelector(".input-date").value = entries.date || new Date().toISOString().replace(/T.*/, "");
            row.querySelector(".input-description").value = entries.description || "";
            row.querySelector(".input-type").value = entries.type || "income";
            row.querySelector(".input-amount").value = entries.amount || 0;
            row.querySelector(".remove").addEventListener("click", e => {
                this.onDeleteEntryBtnClick(e);
            });
            row.querySelectorAll(".input").forEach(input => {
                input.addEventListener("change", () => this.save());
            });
        }

    getEntryRows() {
        return Array.from(this.root.querySelectorAll(".entry tr"));
    }

    onNewEntryBtnClick() {
        this.addEntry();
    }

    onDeleteEntryBtnClick(e) {
        e.target.closest("tr").remove();
        this.save();
    }
}