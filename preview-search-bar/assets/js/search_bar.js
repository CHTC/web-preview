// This page hosts the code that is used on every single page.

// If your js function does not need to be on every page don't put it here!

const MainSearchBar = {
    id: "main-search-bar",
    idx_path: "/web-preview/preview-search-bar/assets/search/index.json",
    metadata_path: "/web-preview/preview-search-bar/assets/search/metadata.json",
    node: undefined,
    input_node: undefined,
    result_node: undefined,
    idx: undefined,
    metadata: undefined,
    load_data: async function(cache=true) {

        if(cache){  // Check for cached data. If there use it, else load and populate it
            this.metadata = JSON.parse(sessionStorage.getItem("main_metadata"))
            if(!this.metadata){
                this.metadata = await fetch(this.metadata_path).then(data => data.json())
                sessionStorage.setItem("main_metadata", JSON.stringify(this.metadata))
            }

            let index = JSON.parse(sessionStorage.getItem("main_index"))
            if(!index){
                index = await fetch(this.idx_path).then(data => data.json())
                this.idx = lunr.Index.load(index)
                sessionStorage.setItem("main_index", JSON.stringify(index))
            } else {
                this.idx = lunr.Index.load(index)
            }
        } else {
            this.metadata = await fetch(this.metadata_path).then(data => data.json())

            let index = await fetch(this.idx_path).then(data => data.json())
            this.idx = lunr.Index.load(index)
        }
    },
    set_up_search_bar: async function(){
        this.node = document.getElementById(this.id)
        this.input_node = this.node.querySelector("input")
        this.result_node = this.node.querySelector(".search-results")

        await this.load_data()

        this.input_node.setAttribute("placeholder", "Search CHTC")

        this.input_node.addEventListener("keyup", () => this.populate_search())
        this.input_node.addEventListener("focusout", () => {
            setTimeout(() => {this.result_node.hidden = true}, 150)
        })
        this.input_node.addEventListener("focus", () => {
            this.result_node.hidden = false;
        })


    },
    get_metadata: function(key) {
        return this.metadata[key]
    },
    populate_search: async function() {

        // Remove the current results
        this.result_node.innerHTML = ""

        let query = this.input_node.value

        if(query == ""){
            return
        }

        let results = this.idx.search(query).slice(0, 5)

        for (const result of results) {

            let new_result_node = document.createElement("div")
            this.result_node.appendChild(new_result_node)

            let metadata = await this.get_metadata(result.ref)
            let complete_metadata = {id:result.ref, ...metadata}
            new_result_node.innerHTML = this.create_results_html(complete_metadata)
        }
    },
    create_results_html: function(metadata){
        let html =  "<div id='search-card' class='result card'>" +
            "<div class='card-body'>" +
            "<div class='card-title text-left'>" +
            "<a href='" + metadata.id + "'>" + metadata.title + "</a>" +
            "</div>" +
            "<h6 class='card-subtitle'>" + metadata.id.slice(0,-5) + "</h6>"
            "</div>" +
            "</div>"

        return html
    }
}

window.onload = MainSearchBar.set_up_search_bar()