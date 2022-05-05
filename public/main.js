// Focus div based on nav button click
function changeNav(newDiv, otherDivs) {
    for (let i = 0; i < otherDivs.length; i++) {
        document.getElementById(otherDivs[i]).className = "hidden"
    }
    document.getElementById(newDiv).className = "active"
    if (newDiv === "single") {
        document.getElementById("singleFlipRes").src="assets/img/coin.png";
        document.getElementById("flipACoinRes").innerHTML = "Click button to flip!"
    }
    if (newDiv === "multi") {
        document.getElementById("summary").innerHTML="";
        document.getElementById("number").value = "";
        let table = document.getElementById("displayTable");
        let numRows = document.getElementById("displayTable").rows.length
        for (let i = numRows - 1; i >= 1; i--) {
            table.deleteRow(i)
        }
    } 
    if (newDiv === "guess") {
        document.getElementById("guessRes").innerHTML = "Result: "
        document.getElementById("guessResImg").src="assets/img/coin.png";
        document.getElementById("guessVal").innerHTML = "Your guess: "
        document.getElementById("guessValImg").src="assets/img/coin.png";
        document.getElementById("winStatement").innerHTML = ""
    }
}


// Flip one coin and show coin image to match result when button clicked
function flipOneCoin() {
    document.getElementById("flipACoinRes").innerHTML = "Flipping..."
    document.getElementById("singleFlipRes").src="assets/img/coin.png";
    fetch("http://localhost:5000/app/flip/")
        .then(res => res.json())
        .then(data => {
            const result = data.flip.toString()
            setTimeout(function(){
                document.getElementById("singleFlipRes").src="assets/img/"+result+".png";
                document.getElementById("flipACoinRes").innerHTML = "Result: " + result + "!"
            }, 200);
        })
}
// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series
function flipMultipleCoins(val) {
    val = Number(val)
    if (!Number.isInteger(val)) {
        alert("Error! Please enter an integer value for number of flips")
        return
    }
    val = parseInt(val, 10)
    let flipString = " flips, with "
    if (val <= 0) {
        alert("Please enter 1 or more flips")
        return
    }
    if (val == 1) {
        flipString = " flip, with "
    }
    fetch("http://localhost:5000/app/flips/"+val)
        .then(res => res.json())
        .then(data => {
            const result = data.raw
            const summary = data.summary
            let table = document.getElementById("displayTable");
            let numRows = document.getElementById("displayTable").rows.length
            for (let i = numRows - 1; i >= 1; i--) {
                table.deleteRow(i)
            }
            setTimeout(function(){
                let resultSummary = document.getElementById("summary")
                resultSummary.innerHTML = (parseInt(summary.tails) + parseInt(summary.heads)).toString() + flipString +
                                          summary.heads.toString() + " heads and " + summary.tails.toString() + " tails."
                for (let i = 0; i < parseInt(summary.tails) + parseInt(summary.heads); i++) {
                    let newRow = table.insertRow(-1);
                    let newCell0 = newRow.insertCell(0);
                    let newCell1 = newRow.insertCell(1);
                    let newCell2 = newRow.insertCell(2);
                    let img = "<img width = '80' height = '80' src = 'assets/img/"+result[i]+".png' />"
                    console.log(img)
                    newCell0.appendChild(document.createTextNode('Flip '+ (i + 1)));
                    newCell1.appendChild(document.createTextNode(result[i]))
                    newCell2.innerHTML = img
                }
            }, 200);
        })

}

// Guess a flip by clicking either heads or tails button
function guessFlip(val) {
    val = val.toString()
    document.getElementById("guessRes").innerHTML = "Flipping..."
    document.getElementById("guessResImg").src="assets/img/coin.png";
    document.getElementById("guessVal").innerHTML = "Your guess: "+val
    document.getElementById("guessValImg").src="assets/img/"+val+".png";
    fetch("http://localhost:5000/app/flip/call/"+val)
        .then(res => res.json())
        .then(data => {
            const result = data.flip.toString()
            const winOrLoss = data.result.toString()
            let winStatement = ""
            if (winOrLoss === "win") {
                winStatement = "Congratulations, you win!"
            }
            else if (winOrLoss === "lose") {
                winStatement = "Unfortunately, you lose!"
            }
            else {
                alert("Error!")
            }
            setTimeout(function(){
                document.getElementById("guessResImg").src="assets/img/"+result+".png";
                document.getElementById("guessRes").innerHTML = "Result: " + result
                document.getElementById("winStatement").innerHTML = winStatement
            }, 200);
        })
}