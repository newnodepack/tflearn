// 간단한 모델 레이아웃을 하나 만듭니다. .
const model = tf.sequential();
model.add(tf.layers.dense({units: 1, inputShape: [1]}));

// 학습할 모델의 설정값을 적용합니다.
model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

// X 축과 Y축을 설정해 학습 목표를 지정합니다. (y = 2x - 1)
const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);

const click_btn = document.getElementById(`do_education`);
click_btn.addEventListener(`click`,async () =>{
    // 사용자가 입력한 값을 숫자로 가져오고
    const input_item_number = parseInt(document.getElementById(`input_item_number`).value, 10);
    const input_item_epoch = parseInt(document.getElementById(`select_epoch`).value, 10);

    // 설정한 x,y축으로 정해진 수(에포크)만큼 학습을 진행한 뒤, 
    await model.fit(xs, ys, {epochs: input_item_epoch});
    
    // 자바스크립트로 p 태그를 하나 만든 다음,
    const newParagraph = document.createElement(`p`);
    newParagraph.className = `training_result`;
    const resultTag = document.getElementById(`action_results`);

    // 학습한 모델에 입력한 x값 하나를 넣고 출력합니다.
    const trainResult = model.predict(tf.tensor2d([input_item_number], [1, 1])).dataSync();
    newParagraph.textContent = `${input_item_epoch}번 학습한 결과 : ${trainResult}`;
    resultTag.appendChild(newParagraph);

});
