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
