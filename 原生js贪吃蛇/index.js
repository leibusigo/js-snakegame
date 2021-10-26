// 绑定监听事件，当加载完HTML后立刻执行
if (window.addEventListener) {
    addEventListener('DOMContentLoaded', loader, false);
}
// 兼容IE8，人为判定HTML是否加载完毕
else {
    // 方法名：load
    // 作用:判断HTML是否加载完毕，完毕则执行主程序
    function load() {
        if (typeof window === "object" && typeof document === "object") {
            clearInterval(timer);
            loader();
        }
    }
    // 设置定时器，每1ms触发一次load方法
    var timer = setInterval(load, 1);
}
// 主程序
function loader() {
    // 初始化地图
    init();
    var snake = new Snake('sele');
    snake.showFood();
    snake.show();
    // 在点击开始游戏前，贪吃蛇不移动
    // snake.speed = 500;
    // snake.run();
    // 设置按下键盘响应事件
    document.onkeydown = function (event) {
        // 兼容IE8
        event = event || window.event;
        // keycode属性已经不再使用,改用key属性
        if (event.key == "ArrowRight") {
            // console.log('right');
            if (snake.direct != 'right') {
                snake.direct = 'right';
            }
        }
        if (event.key == "ArrowLeft") {
            // console.log('left');
            if (snake.direct != 'left') {
                snake.direct = 'left';
            }
        }
        if (event.key == "ArrowUp") {
            // console.log('up');
            if (snake.direct != 'up') {
                snake.direct = 'up';
            }
        }
        if (event.key == "ArrowDown") {
            // console.log('down');
            if (snake.direct != 'down') {
                snake.direct = 'down';
            }
        }
    }
}
// 方法名：init()
// 作用：初始化30*40的地图
function init() {
    var map = document.getElementsByTagName('div')[0];
    var str = "";
    // 每行40个div，用br换行。使用css定制样式
    for (var i = 0; i < 30; i++) {
        for (var j = 0; j < 40; j++) {
            str += "<div>" + j + ":" + i + "</div>";
        }
        str += "<br>";
    }
    map.innerHTML += str;
    console.log("start");
}
// 创建蛇对象
function Snake(setval) {
    // 回调函数的this默认是指向window的，要让他改为指向Snake构造函数
    var This = this;
    // 用id选择器获取sele元素的DOM
    var seleDom = document.getElementById(setval);
    // 给Snake构造函数添加属性
    // 获取select标签元素
    this.select = seleDom.getElementsByTagName('select')[0];
    // 获取第二个span，用以改变分数
    this.span = seleDom.getElementsByTagName('span')[1];
    // 获取input元素
    this.input = seleDom.getElementsByTagName('input')[0];
    // 获取button元素
    this.button = seleDom.getElementsByTagName('button');
    // 获取checkbox中checked属性状态（判定是否无限续玩）
    this.continue = this.input.checked;
    // 设置成绩
    this.score = 0;
    // 设置速度
    this.speed = 0;
    // 设置撞墙或者吃到自己后蛇头最终位置
    this.last = null;
    // 设置方向
    this.direct = "right";
    // 设置定时器
    this.timer = 0;
    // 初始化食物位置
    this.foodIndex = 0;
    // 初始化蛇头位置
    this.headIndex = 0;
    // 设置默认的下拉菜单为正常
    this.select.options[1].selected = true;
    // 初始化body位置
    this.body = [[10, 10, 'red'], [11, 10, '#099e6a']];
    // 获取创建的地图div元素
    this.divs = document.getElementById('map').getElementsByTagName('div');
    // 设置按钮1单击响应事件
    // !!!回调函数中的this指向button，所以这里用This!!!
    this.button[0].onclick = function () {
        // console.log(this);
        // console.log(This);
        // 清除定时器
        clearInterval(This.timer);
        // 将蛇头起始位置设置为上一次的最终位置
        // (若未勾选无限续玩，最终位置已初始化为原始坐标)
        if (This.last) {
            This.body[0] = This.last;
        }
        This.last = null;
        // 设置当前速度，值为读取的select标签中option的value值
        var seleIndex = This.select.selectedIndex;
        var sp = This.select.options[seleIndex].value;
        This.speed = parseInt(sp);
        This.run();
    }
    this.button[1].onclick = function () {
        // 清除定时器，暂停动作
        clearInterval(This.timer);
    }
    // 作用：显现贪吃蛇身体
    this.show = function () {
        for (var i = 0; i < this.body.length; i++) {
            var val = this.inde(this.body[i][0], this.body[i][1]);
            // 判断如果val没有超过div数量
            if (this.divs[val]) {
                this.divs[val].style.backgroundColor = this.body[i][2];
            }
        }
    }
    // 作用：生成食物
    this.showFood = function () {
        // 随机生成一个食物位置
        var ind = this.inde(this.rand("x"), this.rand("y"));
        // 存储食物位置
        this.foodIndex = ind;
        this.divs[ind].style.backgroundColor = "yellow";
    }
    // 作用：让贪吃蛇运动
    this.run = function () {
        // 设置定时器，让贪吃蛇间隔speed ms运动
        this.timer = setInterval(function () {
            This.move();
        }, this.speed);
    }
    // 为盒子编制索引(不要也行)
    for (var i in this.divs) {
        this.divs[i].index = i;
    }
    // 作用：重新开始游戏（进行初始化操作）
    this.restart = function () {
        init();
        this.showFood();
        this.body = [[10, 10, 'red'], [11, 10, '#099e6a']];
        // 初始化蛇头最终位置
        this.last = this.body[0];
        this.headIndex = this.inde(this.body[0][0], this.body[0][1]);
        this.show();
    }
    // 作用：将body(x,y)坐标转化为第几个div 
    this.inde = function (a, b) {
        return a + b * 40;
    }
    // 作用：生成随机数
    // 判断若为x坐标则生成0~40随机数，若y则0~30
    // Math.floor:向下取整； Math.random:生成0~1之间的随机数
    this.rand = function (ergu) {
        return ergu === "x" ? Math.floor(Math.random() * 40) : Math.floor(Math.random() * 30);
    }
    // 作用让贪吃蛇移动1格,需要配合run方法中定时器使用
    this.move = function () {
        var length = this.body.length;
        // 蛇尾div
        var val = this.inde(this.body[length - 1][0], this.body[length - 1][1]);
        // 食物位置颜色变为黄色
        this.divs[this.foodIndex].style.backgroundColor = 'yellow';
        // 设置蛇头索引
        this.headIndex = this.inde(this.body[0][0], this.body[0][1]);
        //将蛇尾设置为透明
        if (val != this.foodIndex && val >= 0 && val < this.divs.length) {
            this.divs[val].style.backgroundColor = 'transparent';
        }
        // 作用：撞墙警告
        this.warnning = function (where) {
            // 清除定时器
            clearInterval(this.timer);
            // 得到蛇头最终位置
            this.last = this.body[0];
            this.last[2] = "red";
            this.divs[val].style.backgroundColor = '#099e6a';
            alert("撞" + where + "墙了，当前得分" + this.score);
            if (!this.continue) {
                this.restart();
            }
        }
        // 当蛇头在第一行(0~39)并且方向是向上时
        if (this.headIndex < 40 && this.direct == 'up') {
            this.warnning('北');
        }
        // 当蛇头在最后一行(1160~1199)并且方向是向下时
        if (this.headIndex > 1159 && this.direct == 'down') {
            this.warnning('南');
        }
        // 当蛇头在第一列并且方向是向左时
        if (this.headIndex % 40 == 0 && this.direct == 'left') {
            this.warnning('西');
        }
        // 当蛇头在最后一列并且方向时向右时
        if ((this.headIndex + 1) % 40 == 0 && this.direct == 'right') {
            this.warnning('东');
        }
        // 遍历贪吃蛇身体每个元素
        for (var i = 1; i < this.body.length; i++) {
            var a0 = this.inde(this.body[i][0], this.body[i][1]);
            // 判断贪吃蛇身体有没有和蛇头索引相同
            if (a0 == this.headIndex) {
                var snakeBody = [];
                clearInterval(this.timer);
                // 储存蛇头最终位置
                this.last = this.body[0];
                this.last[2] = "red";
                // 贪吃蛇不会再移动了，将尾部重新变为绿色
                this.divs[val].style.backgroundColor = '#099e6a';
                for (var i in this.body) {
                    // 将贪吃蛇信息存入snakeBody用于后续判断。不存颜色信息
                    var a1 = this.inde(this.body[i][0], this.body[i][1]);
                    snakeBody.push(a1);
                }
                alert("咬到自己了,当前得分" + this.score);
                // 如果不无限续玩，则重新开始
                if (!this.continue) {
                    this.restart();
                    return;
                }
                else {
                    //输入snakeBody中每一个元素，看是否与当前头部索引
                    // 向上下左右移动后的位置重合
                    if (setHead(this.headIndex + 1)) {
                        console.log(this.headIndex + 1);
                    }
                    else if (setHead(this.headIndex - 1)) {
                        console.log(this.headIndex - 1);
                    }
                    else if (setHead(this.headIndex + 40)) {
                        console.log(this.headIndex + 40);
                    }
                    else if (setHead(this.headIndex - 40)) {
                        console.log(this.headIndex - 40);
                    }
                }
            }
        }
        // 作用：自己咬到自己后重新设置蛇头
        function setHead(num) {
            var isSame = true;
            if (num >= 0 && num <= 1199) {
                // 数组中的some方法，输入snakeBody中每一个元素，看是否与当前头部索引
                // 向上下左右移动后的位置重合。
                isSame = snakeBody.some(function (ele) {
                    return num == ele;
                });
                console.log(isSame);
                // 如果不重合，则将贪吃蛇最终位置定位到此处。方便再无限续玩模式下
                // 继续进行游戏
                if (!isSame) {
                    This.last[0] = num % 40;
                    This.last[1] = Math.floor((num) / 40);
                    return true;
                }
            }
        }
        // 如果没出现蛇头最终位置信息，即每撞墙或者咬到自己
        if (!this.last) {
            // 向后顺移蛇身体的索引
            for (var i = length - 1; i > 0; i--) {
                this.body[i][0] = this.body[i - 1][0];
                this.body[i][1] = this.body[i - 1][1];
            }
        }
        // 不同的方向，蛇头相应的坐标增减
        if (this.direct == 'right') {
            if (!this.last) {
                this.body[0][0] += 1;
            }
        }
        if (this.direct == 'left') {
            if (!this.last) {
                this.body[0][0] -= 1;
            }
        }
        if (this.direct == 'up') {
            if (!this.last) {
                this.body[0][1] -= 1;
            }
        }
        if (this.direct == 'down') {
            if (!this.last) {
                this.body[0][1] += 1;
            }
        }
        // 当蛇头索引和食物索引相同时
        if (this.headIndex == this.foodIndex) {
            // 获取食物所在的div的位置信息
            var text = this.divs[this.foodIndex].innerText.split(':');
            // 将得到的string转换为int型
            var x = parseInt(text[0]);
            var y = parseInt(text[1]);
            // 将新的位置坐标加入数组末尾
            this.body.push([x, y, '#099e6a']);
            // 加分
            this.score++;
            // 修改当前成绩
            this.span.innerHTML = "当前成绩:\t" + this.score + "分";
            // 生成新的食物位置
            this.showFood();
        }
        this.show();
    }
}