var gussFun = require('./gaussFun');
function render (data) {
    renderImg(data);
    renderInfo(data);
    blur(data);
    renderCurTime(0);
    renderAllTime(data.duration);
    renderIsLike(data.isLike);
}
function renderImg(data) {
    $('.song-img').find('img').attr('src', data.image);
}
function renderInfo(data) {
    var str = ' <div class="song-name">\
    <h2>' + data.song +'</h2>\
</div>\
<div class="singer">' + data.singer +'</div>\
<div class="album">' + data.album +'</div>';
    $('.song-info').html(str);
}
function timeFormat(t) {
    var minute = Math.floor(t / 60);
    var second = t - minute * 60;
    if (minute < 10) {
        minute = '0' + minute;
    }
    if (second < 10) {
        second = '0' + second;
    }
    return minute + ':' + second;
}
function renderCurTime(t) {
    var time = timeFormat(t);
    $('.cur-time').html(time);
}
function renderAllTime(t) {
    var time = timeFormat(t);
    $('.all-time').html(time);
}
function blur (data) {
    var img = new Image();
    img.src = data.image;
    img.onload = function () {
        var canvas = $('<canvas width="200" height="200"><canvas>');
        var ctx = canvas[0].getContext('2d');
        ctx.drawImage(img, 0, 0, 200, 200);
        var pixel = ctx.getImageData(0, 0, 200, 200);
        var srcData = gussFun(pixel);
        ctx.putImageData(srcData, 0, 0);
        var imgSrc = canvas[0].toDataURL();
        $('.wrapper').css({
            backgroundImage: 'url(' + imgSrc + ')'
        })
    }
}


function renderIsLike(islike) {
    if (islike) {
        $('.fav').addClass('liking');
    }
}
function renderProcess(per) {
    // 根据进度 渲染小圆点
    $('.pro-spot').css({
        left: per * 100 + '%',
    });
    // 获取小圆点可运动的总的运动的位置
    var left = $('.process').width() - $('.pro-spot').width();
    // 获取当前小圆点当前运动的位置
    var x = $('.pro-spot').offset().left - $('.process').offset().left;
    // 如果小圆点当前位置超出了它可运动的范围 固定他的位置
    if ( x > left) {
        $('.pro-spot').css({
            left: left,
        });
    }
    // 修改进度条的偏移量
    $('.pro-up').css({
        transform: 'translateX(' + (per - 1) * 100 + '%)'
    });
}
module.exports = {
    render: render,
    renderCurTime: renderCurTime,
    renderProcess: renderProcess,
};