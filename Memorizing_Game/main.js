const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", //黑桃花色
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", //紅心花色
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", //方塊花色
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png" //梅花花色
];

const CardPattern = [
  "imgPackage/dot.jpg", //彩點
  "imgPackage/yellow.jpg", //幾何
  "imgPackage/blue.jpg" //星球
];

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];

    return `
      <p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>
    `;
  },

  getCardElement(index) {
    return `<div data-index="${index}" class="card back ${model.backPattern}"></div>`;
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join(``);
  },

  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back", `${model.backPattern}`);
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      card.classList.add("back", `${model.backPattern}`);
      card.innerHTML = null;
    });
  },

  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },

  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (e) => {
          card.classList.remove("wrong");
        },
        {
          once: true
        }
      );
    });
  },

  showGameFinished() {
    //最後成績紀錄
    model.scoreRecord.push(model.triedTimes);
    // 將scoreRecord中成績由小到大排序
    model.scoreRecord.sort(function (a, b) {
      return a - b;
    });
    const div = document.createElement("div");
    div.classList.add("complete-container");
    div.innerHTML = `
      <div id="banner">
        <h2>Completed!</h2>
        <p>${model.triedTimes} times</p>
      </div>
      <div id="record">
      </div>
      <div id="cardPattern">
        <h3>New<br>Pattern</h3>
        <div><img src=${CardPattern[0]} alt=""></div>
        <div><img src=${CardPattern[1]} alt=""></div>
        <div><img src=${CardPattern[2]} alt=""></div>
      </div>
      <button id="play-btn"><i class="fa-solid fa-heart"></i>Play Again</button>
    `;
    const header = document.querySelector("#header");
    header.before(div);
    view.renderScoreRecord();
  },

  renderScoreRecord() {
    const scoreBoard = document.querySelector("#record");
    let rawHTML = "";
    rawHTML += `<li>Best Record: ${model.scoreRecord[0]} times</li>`;
    if (model.scoreRecord.length === 2) {
      rawHTML += `<li>Second Record: ${model.scoreRecord[1]} times</li>`;
    } else if (model.scoreRecord.length === 3) {
      rawHTML += `
      <li>Second Record: ${model.scoreRecord[1]} times</li>
      <li>Third Record: ${model.scoreRecord[2]} times</li>
      `;
    }
    scoreBoard.innerHTML = rawHTML;
  },

  gameFinishedPanelAction() {
    // Play Again
    const playBtn = document.querySelector("#play-btn");
    playBtn.addEventListener("click", controller.retartGame);

    // Change Pattern
    const cardPattern = document.querySelector("#cardPattern");
    cardPattern.addEventListener("click", (event) => {
      const target = event.target;
      if (target.tagName === "IMG") {
        switch (target.src.slice(22)) {  //src port "http://127.0.0.1:5500/"
          case CardPattern[0]:
            model.backPattern = "back-pattern-dot";
            break;
          case CardPattern[1]:
            model.backPattern = "back-pattern-yellow";
            break;
          case CardPattern[2]:
            model.backPattern = "back-pattern-blue";
        }
      }
      controller.retartGame();
    });
  },

  vailGameFinished() {
    document.querySelector(".complete-container").remove();
    controller.currentState = GAME_STATE.FirstCardAwaits;
    console.log(`change currentState to ${GAME_STATE.FirstCardAwaits}`);
  }
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index]
      ];
    }
    return number;
  }
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes); 
        view.flipCards(card);
        model.revealedCards.push(card);

        if (model.isRevealedCardsMatched()) {
          //配對成功
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          if (model.score === 260) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            view.gameFinishedPanelAction();
            console.log("call gameFinishedPanelAction()");
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
    console.log(`currentState:`, this.currentState);
    console.log(
      `revealedCards:`,
      model.revealedCards.map((card) => card.dataset.index)
    );
  },

  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
  
  retartGame() {
    // 關閉結束畫面
    view.vailGameFinished();

    // 將 model 中的 score 紀錄歸零，且執行 view.renderScore 使畫面中的 score 也歸零
    model.score = 0;
    view.renderScore(model.score);

    // 將 model 中的 triedTimes 紀錄歸零，且執行 view.renderTriedTimes 使畫面中的 Times 也歸零
    model.triedTimes = 0;
    view.renderTriedTimes(model.triedTimes);

    // 數值歸零後，再開始發牌
    controller.generateCards();
    console.log(`finishedview finished, generate Cards`);
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", (event) => {
        controller.dispatchCardAction(card);
      });
    });
  }
};

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },

  score: 0,

  triedTimes: 0,

  scoreRecord: [],

  backPattern: "back-pattern-default"
};

controller.generateCards();

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
