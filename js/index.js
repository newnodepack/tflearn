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

const menu_icon = document.getElementById(`site_menu_icon`);
menu_icon.addEventListener(`click`, () => {
    const menu_layout = document.getElementById(`sidebar_black_frame`);
    menu_layout.classList.toggle(`toggle_visible`);
});

google.charts.load('current', {'packages':['corechart']});

const drawChart = () => {
    // 그래프 넓이 동적 조정
    const chat_frame = document.getElementById(`curve_chart`);
    const chart_width = chat_frame.offsetWidth - 16;
    console.log(chart_width);

    const data = google.visualization.arrayToDataTable([
        ['입력값', '입력값, 결과값'],
        ['-1',-3],
        ['0',-1],
        ['1',1],
        ['2',3],
        ['3',5],
        ['4',7],
    ]);

    const options = {
        title: 'y = 2x - 1',
        hAxis: {title: 'x Value', minValue: -5, maxValue: 15},
        vAxis: {title: 'y Value', minValue: -1, maxValue: 15},
        legend: 'none',
        width: chart_width,
    };

    const chart = new google.visualization.ScatterChart(document.getElementById('curve_chart'));

    chart.draw(data, options);
}
google.charts.setOnLoadCallback(drawChart);