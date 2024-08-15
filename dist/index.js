"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var phaser_1 = __importDefault(require("phaser"));
var StartScene = /** @class */ (function (_super) {
    __extends(StartScene, _super);
    function StartScene() {
        return _super.call(this, 'start-scene') || this;
    }
    StartScene.prototype.preload = function () {
        this.load.image('startButton', 'assets/start_button.png'); // スタートボタンの画像を読み込む
    };
    StartScene.prototype.create = function () {
        var _this = this;
        // スタートボタンを配置
        var button = this.add.image(this.scale.width / 2, this.scale.height / 2, 'startButton');
        button.setInteractive();
        // スタートボタンがクリックされたときにShadowGameシーンを開始
        button.on('pointerdown', function () {
            _this.scene.start('shadow-game');
        });
        // ボタンのサイズを調整
        var buttonWidth = this.scale.width / 3;
        button.setDisplaySize(buttonWidth, button.height * (buttonWidth / button.width));
    };
    return StartScene;
}(phaser_1.default.Scene));
var ShadowGame = /** @class */ (function (_super) {
    __extends(ShadowGame, _super);
    function ShadowGame() {
        var _this = _super.call(this, 'shadow-game') || this;
        _this.animals = [];
        _this.shadow = null;
        _this.correctAnimalKey = '';
        _this.currentDepth = 0; // 現在の最大深度を追跡
        _this.correctSound = null;
        _this.seikaiVoice = null;
        _this.yattaneVoice = null;
        _this.wrongSound = null;
        return _this;
    }
    ShadowGame.prototype.preload = function () {
        this.load.image('elephant', 'assets/elephant.png');
        this.load.image('lion', 'assets/lion.png');
        this.load.image('hippo', 'assets/hippo.png');
        this.load.image('shadow-elephant', 'assets/shadow_elephant.png');
        this.load.image('shadow-lion', 'assets/shadow_lion.png');
        this.load.image('shadow-hippo', 'assets/shadow_hippo.png');
        this.load.image('tree', 'assets/tree.png'); // 木の画像を読み込む
        this.load.image('grass', 'assets/grass.png'); // 草の画像を読み込む
        this.load.audio('correctSound', 'assets/quiz-pinpon.mp3'); // 正解の音を読み込む
        this.load.audio('seikaiVoice', 'assets/voice-seikai.mp3'); // 正解の音声を読み込む
        this.load.audio('yattaneVoice', 'assets/voice-yattane.mp3'); // やったねの音声を読み込む
        this.load.audio('wrongSound', 'assets/quiz-bu.mp3'); // 不正解の音を読み込む
    };
    ShadowGame.prototype.create = function () {
        var _this = this;
        // サウンドオブジェクトを作成
        this.correctSound = this.sound.add('correctSound');
        this.seikaiVoice = this.sound.add('seikaiVoice');
        this.yattaneVoice = this.sound.add('yattaneVoice');
        this.wrongSound = this.sound.add('wrongSound');
        // 画面の上半分を水色、下半分を緑色に設定
        var upperBackground = this.add.rectangle(0, 0, this.scale.width, this.scale.height / 3, 0x87CEEB).setOrigin(0);
        var lowerBackground = this.add.rectangle(0, this.scale.height / 3, this.scale.width, this.scale.height * 2 / 3, 0x3bae39).setOrigin(0);
        // 背景を最背面に設定
        upperBackground.setDepth(-3);
        lowerBackground.setDepth(-3);
        // 木を配置
        var treeHeight = this.scale.height / 5;
        var treeYPosition = this.scale.height * 1.1 / 3; // 背景の緑色の端にぴったり重なる位置
        var treeLeft = this.add.image(0, treeYPosition, 'tree').setOrigin(0, 1);
        var treeRight = this.add.image(this.scale.width, treeYPosition, 'tree').setOrigin(1, 1);
        // 木の高さを設定
        treeLeft.setDisplaySize(treeLeft.width * (treeHeight / treeLeft.height), treeHeight);
        treeRight.setDisplaySize(treeRight.width * (treeHeight / treeRight.height), treeHeight);
        treeLeft.setDepth(-2);
        treeRight.setDepth(-2);
        // 草を配置
        var grassPositions = [
            { x: this.scale.width * 0.1, y: this.scale.height * 2.5 / 6 },
            { x: this.scale.width * 0.85, y: this.scale.height * 2.3 / 6 },
            { x: this.scale.width * 0.2, y: this.scale.height * 3.3 / 6 },
            { x: this.scale.width * 0.8, y: this.scale.height * 3.4 / 6 },
            { x: this.scale.width * 0.15, y: this.scale.height * 5.4 / 6 },
            { x: this.scale.width * 0.5, y: this.scale.height * 5.2 / 6 },
            { x: this.scale.width * 0.9, y: this.scale.height * 5.4 / 6 },
        ];
        grassPositions.forEach(function (position) {
            var grass = _this.add.image(position.x, position.y, 'grass');
            var grassHeight = _this.scale.height / 15;
            grass.setDisplaySize(grass.width * (grassHeight / grass.height), grassHeight);
            grass.setDepth(-2);
        });
        // テキストを追加
        var textStyle = { fontSize: Math.min(this.scale.width, this.scale.height) / 12, color: '#0d6c0c', fontFamily: '"M PLUS 1p", sans-serif' };
        var questionText = this.add.text(this.scale.width / 2, 30, 'だれのかげかな？', textStyle);
        questionText.setOrigin(0.5, 0); // テキストを中央揃え
        var isLandscape = this.scale.width > this.scale.height;
        var animalWidth = isLandscape ? this.scale.width * 0.8 / 3 : this.scale.width * 0.8 / 2;
        // 正解の動物をランダムに選択
        var correctIndex = phaser_1.default.Math.Between(0, 2);
        this.correctAnimalKey = ['elephant', 'lion', 'hippo'][correctIndex];
        // 影を中央、上部から1/4の位置に配置
        this.shadow = this.add.image(this.scale.width / 2, this.scale.height * 1.2 / 4, "shadow-".concat(this.correctAnimalKey));
        this.shadow.setDisplaySize(animalWidth, this.shadow.height * (animalWidth / this.shadow.width));
        if (isLandscape) {
            // 横長の場合、画面の下1/2を横に3等分して配置
            var positionsX = [
                this.scale.width / 6, // 左
                this.scale.width / 2, // 中央
                (this.scale.width * 5) / 6 // 右
            ];
            this.animals = [
                this.add.image(positionsX[0], this.scale.height * 3 / 4, 'elephant').setInteractive({ draggable: true }),
                this.add.image(positionsX[1], this.scale.height * 3 / 4, 'lion').setInteractive({ draggable: true }),
                this.add.image(positionsX[2], this.scale.height * 3 / 4, 'hippo').setInteractive({ draggable: true })
            ];
        }
        else {
            // 縦長の場合、画面の下1/2を縦に2等分して配置
            var positionsY = [
                this.scale.height * 6 / 8, // 下
                this.scale.height * 4.5 / 8 // 上
            ];
            this.animals = [
                this.add.image(this.scale.width / 2, positionsY[1], 'lion').setInteractive({ draggable: true }),
                this.add.image(this.scale.width * 1 / 4, positionsY[0], 'elephant').setInteractive({ draggable: true }),
                this.add.image(this.scale.width * 3 / 4, positionsY[0], 'hippo').setInteractive({ draggable: true })
            ];
        }
        // 動物のサイズを設定
        this.animals.forEach(function (animal) {
            animal.setDisplaySize(animalWidth, animal.height * (animalWidth / animal.width));
        });
        // ドラッグイベントの追加
        this.input.setDraggable(this.animals);
        this.input.on('dragstart', function (pointer, gameObject) {
            // ドラッグを開始したときに、動物を最前面に移動
            _this.currentDepth += 1; // 深度を増加
            gameObject.setDepth(_this.currentDepth); // 現在の最大深度を設定
        });
        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        this.input.on('dragend', function (pointer, gameObject) {
            if (_this.checkOverlap(gameObject, _this.shadow)) {
                _this.handleAnimalDrop(gameObject);
            }
            else {
                // 影と重ならない場合、動物はそのままの位置に留まる
            }
        });
    };
    ShadowGame.prototype.checkOverlap = function (spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();
        return phaser_1.default.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
    };
    ShadowGame.prototype.handleAnimalDrop = function (droppedAnimal) {
        var _this = this;
        if (droppedAnimal.texture.key === this.correctAnimalKey) {
            // 正解の場合
            this.time.delayedCall(1600, function () {
                _this.correctSound.play();
            });
            this.time.delayedCall(2500, function () {
                _this.yattaneVoice.play();
            });
            this.time.delayedCall(3300, function () {
                _this.seikaiVoice.play();
            });
            droppedAnimal.disableInteractive(); // 正解の動物のインタラクティブ性を無効にする
            this.shadow.disableInteractive(); // 影のインタラクティブ性も無効にする
            this.tweens.add({
                targets: droppedAnimal,
                y: "+=10", // 右に10px
                yoyo: true,
                repeat: 6, // 3回揺れる
                duration: 120,
                ease: 'Sine.easeInOut',
                onComplete: function () {
                    _this.tweens.add({
                        targets: droppedAnimal,
                        x: _this.shadow.x,
                        y: _this.shadow.y,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: function () {
                            // 不正解の動物をフェードアウトして消す
                            _this.animals.forEach(function (animal) {
                                if (animal !== droppedAnimal) {
                                    _this.tweens.add({
                                        targets: animal,
                                        alpha: 0,
                                        duration: 800,
                                        ease: 'Power2',
                                        onComplete: function () {
                                            animal.destroy(); // フェードアウト後に削除
                                        }
                                    });
                                }
                            });
                            // 0.5秒後に動物と影を中央に移動
                            _this.time.delayedCall(500, function () {
                                _this.tweens.add({
                                    targets: [droppedAnimal, _this.shadow],
                                    x: _this.scale.width / 2,
                                    y: _this.scale.height / 2,
                                    duration: 800,
                                    ease: 'Power2'
                                });
                            });
                        }
                    });
                }
            });
        }
        else {
            // 不正解の場合、動物をガタガタと揺れた後にフェードアウトして消す
            this.time.delayedCall(1600, function () {
                _this.wrongSound.play(); // 不正解の音を再生
            });
            this.tweens.add({
                targets: droppedAnimal,
                y: "+=10", // 右に10px
                yoyo: true,
                repeat: 6, // 3回揺れる
                duration: 120,
                ease: 'Sine.easeInOut',
                onComplete: function () {
                    _this.tweens.add({
                        targets: droppedAnimal,
                        alpha: 0,
                        duration: 800,
                        ease: 'Power2',
                        onComplete: function () {
                            droppedAnimal.destroy(); // フェードアウト後に削除
                        }
                    });
                }
            });
        }
    };
    return ShadowGame;
}(phaser_1.default.Scene));
var config = {
    type: phaser_1.default.AUTO,
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    scene: [StartScene, ShadowGame],
    backgroundColor: '#87CEEB', // 背景色を水色に設定
    scale: {
        mode: phaser_1.default.Scale.FIT,
        autoCenter: phaser_1.default.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
    }
};
var game = new phaser_1.default.Game(config);
