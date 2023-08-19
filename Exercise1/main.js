const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

let start = () => {
    handleEventPlace()
}

let handleEventPlace = () => {
    const succeedBtn = $("#succeed-btn")
    const warningBtn = $("#warning-btn")
    const errorBtn = $("#error-btn")

    succeedBtn.onclick = function() {
        createMessageElement("Succeed", "color-00e100")
    }
    warningBtn.onclick = function() {
        createMessageElement("Warning", "color-ffff00")
    }
    errorBtn.onclick = function() {
        createMessageElement("Error", "color-ff4a4a")
    }
}

let createMessageElement = (content, fontColor) => {
    const toast = $("#toast")
    const divElement = document.createElement("div")

    divElement.classList.add("toast-item", `${fontColor}`)
    divElement.innerHTML = `
        <div class="toast-icon"><i class="fas fa-check-circle"></i></div>
        <div class="toast-content">
            <h3>${content}</h3>
        </div>
        <div class="toast-close"><i class="fas fa-times"></i></div>
    `
    toast.appendChild(divElement)
    let time = setTimeout(()=>{
        toast.removeChild(divElement)
    }, 4000)

    divElement.onclick = function(event) {
        if(event.target.closest(".toast-close")){
            toast.removeChild(divElement)
            clearTimeout(time)
        }
    }
}
start()