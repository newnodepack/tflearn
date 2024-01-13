let isWeb = false;
const onDeviceReady = () => {
    // Cordova is now initialized. Have fun!
    if(cordova.platformId == `browser`){
        isWeb = true;
    }
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    console.log(isWeb);
}

document.addEventListener('deviceready', onDeviceReady, false);

// 푸터 연도 조정
var currentYear = new Date().getFullYear();
document.getElementById('currentYear').textContent = currentYear;

// 사이드메뉴
const menu_icon = document.getElementById(`site_menu_icon`);
menu_icon.addEventListener(`click`, () => {
    const menu_layout = document.getElementById(`sidebar_black_frame`);
    menu_layout.classList.toggle(`toggle_visible`);
});

import {MnistData} from './secondLearn.js';

async function showExamples(data) {
  // tfvisor 이라고 불리는 라이브러리를 사용해 데이터를 보여줄 준비를 합니다.
  const surface =
    tfvis.visor().surface({ name: 'Input Data 예제', tab: 'Input Data'});


  // 학습된 데이터를 사용하여 샘플 데이터를 만들어냅니다.
  const examples = data.nextTestBatch(20);
  const numExamples = examples.xs.shape[0];

  // 만들어진 데이터를 캔버스를 사용해 28x28 픽셀 크기로 각각 만들어 tfvisor에 그려서 보여줍니다.
  for (let i = 0; i < numExamples; i++) {
    const imageTensor = tf.tidy(() => {
      // Reshape the image to 28x28 px
      return examples.xs
        .slice([i, 0], [1, examples.xs.shape[1]])
        .reshape([28, 28, 1]);
    });

    const canvas = document.createElement('canvas');
    canvas.width = 28;
    canvas.height = 28;
    canvas.style = 'margin: 4px;';
    await tf.browser.toPixels(imageTensor, canvas);
    surface.drawArea.appendChild(canvas);

    imageTensor.dispose();
  }
}

document.addEventListener('DOMContentLoaded', run);

// 샘플로 만든 이미지를 가지고 본격적으로 쓸 모델을 만듭니다.
function getModel() {
  const model = tf.sequential();

  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const IMAGE_CHANNELS = 1;

  model.add(tf.layers.conv2d({
    inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));


  model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));


  model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));
  model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

  // 모델을 인식하기 위해 단순화 하는 작업
  model.add(tf.layers.flatten());

  const NUM_OUTPUT_CLASSES = 10;
  model.add(tf.layers.dense({
    units: NUM_OUTPUT_CLASSES,
    kernelInitializer: 'varianceScaling',
    activation: 'softmax'
  }));

  // 결과를 최적화하기 위한 옵티마이저를 설정합니다.
  const optimizer = tf.train.adam();
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  // 생성된 모델을 반환합니다.
  return model;
}

// 집어넣은 모델로 훈련한 결과를 tfvisor 에 표시합니다.
async function train(model, data) {
  const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
  const container = {
    name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
  };
  const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

  const BATCH_SIZE = 512;
  const TRAIN_DATA_SIZE = 5500;
  const TEST_DATA_SIZE = 1000;

  const [trainXs, trainYs] = tf.tidy(() => {
    const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
    return [
      d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
      d.labels
    ];
  });

  const [testXs, testYs] = tf.tidy(() => {
    const d = data.nextTestBatch(TEST_DATA_SIZE);
    return [
      d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]),
      d.labels
    ];
  });

  return model.fit(trainXs, trainYs, {
    batchSize: BATCH_SIZE,
    validationData: [testXs, testYs],
    epochs: 10,
    shuffle: true,
    callbacks: fitCallbacks
  });
}

const classNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

// 훈련한 결과의 성공과 실패율을 표시
async function showAccuracy(model, data) {
  const [preds, labels] = doPrediction(model, data);
  const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
  const container = {name: 'Accuracy', tab: 'Evaluation'};
  tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

  labels.dispose();
}

function doPrediction(model, data, testDataSize = 500) {
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const testData = data.nextTestBatch(testDataSize);
  const testxs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
  const labels = testData.labels.argMax(-1);
  const preds = model.predict(testxs).argMax(-1);

  testxs.dispose();
  return [preds, labels];
}

// 결과 표를 tfvisor 에 렌더링 해서 표시합니다.
async function showConfusion(model, data) {
  const [preds, labels] = doPrediction(model, data);
  const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
  const container = {name: 'Confusion Matrix', tab: 'Evaluation'};
  tfvis.render.confusionMatrix(container, {values: confusionMatrix, tickLabels: classNames});

  labels.dispose();

  const layout_box = document.getElementById(`site_main_h2`);
  layout_box.innerText = `Loading Complete!`;
}


// 이 코드에서 작업을 순서대로 실행합니다.
async function run() {
  const data = new MnistData(); // 객체 지향 형태로 클래스 호출
  await data.load(); // 1. 샘플이미지로 학습 하고 학습한 모델을 data 내에 저장합니다.
  await showExamples(data); // 약 20개 정도만 학습된 데이터에 집어 넣고 샘플 모델로 만들어내어 사용자에게 표시합니다.
  const model = getModel(); // 본격적으로 모델을 생성
  tfvis.show.modelSummary({name: 'Model Architecture', tab: 'Model'}, model); // tfvisor라는 레이아웃에 모델을 표시할 틀을 생성
  await train(model, data); // 만들어진 모델과 샘플로 본격적인 훈련작업에 돌입
  await showAccuracy(model, data); // 적중률과 오차율을 표시
  await showConfusion(model, data);// 훈련한 결과물을 사용자가 볼 수 있도록 표시합니다.
}