require('../less/index.less');
var $ = require('zepto');
var render = require('./render');
var audio = new Audio();
// 歌曲列表
var songList = [];
// 当前播放音乐的详细信息
var curAudioInfo = null;
// 当前播放的音乐索引值
var index = 0;
// 当前播放的状态
var status = false;
// 每次页面重绘执行函数的标志
var frameId = null;
// 获取歌曲信息
function getData() {
    $.ajax({
        url: '/mock/data.json',
        type: 'GET',
        success: function (data) {
            songList = data;
            bindClickEvent();
            bindTouchEvent();
            $(document).trigger('changeAudio', index);
        }
    })
}
getData();
// 绑定点击事件
function bindClickEvent() {
    // 新增一个事件  手动触发  （将其他点击事件共有的代码提出）
    $(document).on('changeAudio', function (event, index) {
        // 绘制页面
        render.render(songList[index]);
        // 设置音乐地址
        audio.src = songList[index].audio;
        // 保存当前播放的音乐信息
        curAudioInfo = songList[index];
        // 如果当前是播放的状态  播放音乐并且设置进度条
        if (status) {
            audio.play();
            setProcess();
        }
    })
    // 播放按钮点击
    $('.play').click(function(e) {
        // 如果当前是暂停状态 播放音乐 否则暂停  
        if (audio.paused) {
            // 播放音乐的时候需要把当前播放状态（status）保存一下  并且让进度条运动，修改按钮样式
            audio.play();
            setProcess();
            status = true;
            $(this).addClass('pause');
        } else {
            // 暂停音乐的时候需要把当前暂停的状态（status）保存一下, 并且让进度条停止，修改按钮样式
            audio.pause();
            status = false;
            $(this).removeClass('pause');
            cancelAnimationFrame(frameId);
        }    
    });
    // 点击上一首
    $('.prev').click(function (e) {
        // 若当前音乐的索引值为 0  则上一首为列表中最后一首 
        if (index == 0) {
            index = songList.length - 1;
        } else {
            // 否则索引值-1
            index --;
        }
        // 手动触发changeAudio事件  用来更新音乐信息
       $(document).trigger('changeAudio', index);
    });
    // 点击下一首
    $('.next').click(function (e) {
        // 当前音乐的索引值为列表中最后一首歌的时候  将索引值变成0
        if (index == songList.length - 1) {
            index = 0;
        } else {
            // 否则索引值+1
            index ++;
        }
        // 手动触发changeAudio事件  用来更新音乐信息
        $(document).trigger('changeAudio', index);
    });
}
// 绑定touch事件  移动端的的鼠标事件是touchstart   touchmove  touchend
function bindTouchEvent() {
    // 进度条区域相对于文档的左边距离  
    var offsetLeft = $('.process').offset().left;
    // 进度条区域的总宽度
    var width = $('.process').width();
    // 开始拖动原点的时候
    $('.pro-spot').on('touchstart', function () {
        cancelAnimationFrame(frameId);
    }).on('touchmove', function (e) {
        // 相对于进度条宽度  拖动的距离
        var x = e.changedTouches[0].clientX - offsetLeft;
        // 当前拖动到的进度
        var ratio = x / width;
        // 根据当前进度设置当前时间
        setCurTime(ratio);
        // 根据进度渲染进度条
        render.renderProcess(ratio);
        // 播放音乐
        audio.play();
        // 改变当前播放的状态
        status = true;
        // 设置进度条
        setProcess();
        // 修改播放按钮的样式
        $('.play').addClass('pause');

    }).on('touchend', function (e) {
        console.log('end');
    });
    // 当前音乐播放完成之后 手动触发播放下一首
    $(audio).on('ended', function () {
        $('.next').trigger('click');
    });
}
// 进度条运动
function setProcess() {
    // 清理一下页面重绘时触发的函数（相当于清理定时器）
    cancelAnimationFrame(frameId);
    // 每次页面重绘的时候执行的函数 （相当于定时器处理函数）
    var frame = function () {
        // 获取当前播放时间
        var time = Math.round(audio.currentTime);
        // 渲染当前播放时间
        render.renderCurTime(time);
        // 获取当前播放进度
        var ratio = getCurRatio();
        // 根据进度渲染进度条
        render.renderProcess(ratio);
        // 添加监听  相当于添加定时器  递归的过程
        frameId = requestAnimationFrame(frame);
        // console.log(audio.currentTime, curAudioInfo.duration)
        // 如果当前播放时间大于等于总时
        if ( curAudioInfo.duration - audio.currentTime < 2) {
            cancelAnimationFrame(frameId);
            // 手动触发下一首播放
            $('.next').trigger('click');
        }
    }
    frame();
}
// 获取当前进度
function getCurRatio() {
    return audio.currentTime / curAudioInfo.duration;
}
// 根据进度设置当前时间
function setCurTime(ratio) {
    // 当前时间等于当前进度*总的播放时间
    var time = ratio * curAudioInfo.duration;
    // 设置音乐播放时间
    audio.currentTime = time;
    // 渲染当前时间
    render.renderCurTime(Math.round(time));
}
