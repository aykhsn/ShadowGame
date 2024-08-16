import Phaser from 'phaser';

class StartScene extends Phaser.Scene {
    constructor() {
        super('start-scene');
    }

    preload() {
        this.load.image('startButton', 'assets/button-start.png'); // スタートボタンの画像を読み込む
    }

    create() {
        // スタートボタンを配置
        const button = this.add.image(this.scale.width / 2, this.scale.height / 2, 'startButton');
        button.setInteractive();

        // スタートボタンがクリックされたときにShadowGameシーンを開始
        button.on('pointerdown', () => {
            this.scene.start('shadow-game');
        });

        // ボタンのサイズを調整
        const buttonWidth = Math.min(this.scale.width, this.scale.height) / 2;
        button.setDisplaySize(buttonWidth, button.height * (buttonWidth / button.width));
    }
}

class ShadowGame extends Phaser.Scene {
    private animals: Phaser.GameObjects.Image[] = [];
    private shadow: Phaser.GameObjects.Image | null = null;
    private correctAnimalKey: string = '';
    private currentDepth: number = 0; // 現在の最大深度を追跡

    private correctSound: Phaser.Sound.BaseSound | null = null;
    private seikaiVoice: Phaser.Sound.BaseSound | null = null;
    private yattaneVoice: Phaser.Sound.BaseSound | null = null;
    private wrongSound: Phaser.Sound.BaseSound | null = null;

    constructor() {
        super('shadow-game');
    }

    preload() {
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
    }

    create() {
        // サウンドオブジェクトを作成
        this.correctSound = this.sound.add('correctSound');
        this.seikaiVoice = this.sound.add('seikaiVoice');
        this.yattaneVoice = this.sound.add('yattaneVoice');
        this.wrongSound = this.sound.add('wrongSound');

        // 画面の上半分を水色、下半分を緑色に設定
        const upperBackground = this.add.rectangle(0, 0, this.scale.width, this.scale.height / 3, 0x87CEEB).setOrigin(0);
        const lowerBackground = this.add.rectangle(0, this.scale.height / 3, this.scale.width, this.scale.height * 2 / 3, 0x3bae39).setOrigin(0);

        // 背景を最背面に設定
        upperBackground.setDepth(-3);
        lowerBackground.setDepth(-3);

        // 木を配置
        const treeHeight = this.scale.height / 5;
        const treeYPosition = this.scale.height * 1.1 / 3; // 背景の緑色の端にぴったり重なる位置
        const treeLeft = this.add.image(0, treeYPosition, 'tree').setOrigin(0, 1);
        const treeRight = this.add.image(this.scale.width, treeYPosition, 'tree').setOrigin(1, 1);

        // 木の高さを設定
        treeLeft.setDisplaySize(treeLeft.width * (treeHeight / treeLeft.height), treeHeight);
        treeRight.setDisplaySize(treeRight.width * (treeHeight / treeRight.height), treeHeight);

        treeLeft.setDepth(-2);
        treeRight.setDepth(-2);

        // 草を配置
        const grassPositions = [
            { x: this.scale.width * 0.1, y: this.scale.height * 2.5 / 6 },
            { x: this.scale.width * 0.85, y: this.scale.height * 2.3 / 6 },
            { x: this.scale.width * 0.2, y: this.scale.height * 3.3 / 6 },
            { x: this.scale.width * 0.8, y: this.scale.height * 3.4 / 6 },
            { x: this.scale.width * 0.15, y: this.scale.height * 5.4 / 6 },
            { x: this.scale.width * 0.5, y: this.scale.height * 5.2 / 6 },
            { x: this.scale.width * 0.9, y: this.scale.height * 5.4 / 6 },
        ];

        grassPositions.forEach(position => {
            const grass = this.add.image(position.x, position.y, 'grass');
            const grassHeight = this.scale.height / 15;
            grass.setDisplaySize(grass.width * (grassHeight / grass.height), grassHeight);
            grass.setDepth(-2);
        });

        // テキストを追加
        const textStyle = { fontSize: Math.min(this.scale.width, this.scale.height) / 12, color: '#0d6c0c', fontFamily: '"M PLUS 1p", sans-serif' };
        const questionText = this.add.text(this.scale.width / 2, 30, 'だれのかげかな？', textStyle);
        questionText.setOrigin(0.5, 0); // テキストを中央揃え

        const isLandscape = this.scale.width > this.scale.height;
        const animalWidth = isLandscape ? this.scale.width * 0.8 / 3 : this.scale.width * 0.8 / 2;

        // 正解の動物をランダムに選択
        const correctIndex = Phaser.Math.Between(0, 2);
        this.correctAnimalKey = ['elephant', 'lion', 'hippo'][correctIndex];

        // 影を中央、上部から1/4の位置に配置
        this.shadow = this.add.image(this.scale.width / 2, this.scale.height * 1.2 / 4, `shadow-${this.correctAnimalKey}`);
        this.shadow.setDisplaySize(animalWidth, this.shadow.height * (animalWidth / this.shadow.width));

        if (isLandscape) {
            // 横長の場合、画面の下1/2を横に3等分して配置
            const positionsX = [
                this.scale.width / 6,  // 左
                this.scale.width / 2,  // 中央
                (this.scale.width * 5) / 6  // 右
            ];
            this.animals = [
                this.add.image(positionsX[0], this.scale.height * 3 / 4, 'elephant').setInteractive({ draggable: true }),
                this.add.image(positionsX[1], this.scale.height * 3 / 4, 'lion').setInteractive({ draggable: true }),
                this.add.image(positionsX[2], this.scale.height * 3 / 4, 'hippo').setInteractive({ draggable: true })
            ];
        } else {
            // 縦長の場合、画面の下1/2を縦に2等分して配置
            const positionsY = [
                this.scale.height * 6 / 8,  // 下
                this.scale.height * 4.5 / 8  // 上
            ];
            this.animals = [
                this.add.image(this.scale.width / 2, positionsY[1], 'lion').setInteractive({ draggable: true }),
                this.add.image(this.scale.width * 1 / 4, positionsY[0], 'elephant').setInteractive({ draggable: true }),
                this.add.image(this.scale.width * 3 / 4, positionsY[0], 'hippo').setInteractive({ draggable: true })
            ];
        }

        // 動物のサイズを設定
        this.animals.forEach(animal => {
            animal.setDisplaySize(animalWidth, animal.height * (animalWidth / animal.width));
        });

        // ドラッグイベントの追加
        this.input.setDraggable(this.animals);

        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            // ドラッグを開始したときに、動物を最前面に移動
            this.currentDepth += 1; // 深度を増加
            gameObject.setDepth(this.currentDepth); // 現在の最大深度を設定
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (this.checkOverlap(gameObject, this.shadow!)) {
                this.handleAnimalDrop(gameObject);
            } else {
                // 影と重ならない場合、動物はそのままの位置に留まる
            }
        });
    }

    checkOverlap(spriteA: Phaser.GameObjects.Image, spriteB: Phaser.GameObjects.Image) {
        const boundsA = spriteA.getBounds();
        const boundsB = spriteB.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
    }

    handleAnimalDrop(droppedAnimal: Phaser.GameObjects.Image) {
        if (droppedAnimal.texture.key === this.correctAnimalKey) {
            // 正解の場合
            this.time.delayedCall(1600, () => {
                this.correctSound!.play();
            });
    
            this.time.delayedCall(2500, () => {
                this.yattaneVoice!.play();
            });
    
            this.time.delayedCall(3300, () => {
                this.seikaiVoice!.play();
            });
    
            droppedAnimal.disableInteractive();  // 正解の動物のインタラクティブ性を無効にする
            this.shadow!.disableInteractive();  // 影のインタラクティブ性も無効にする
    
            this.tweens.add({
                targets: droppedAnimal,
                y: `+=10`, // 右に10px
                yoyo: true,
                repeat: 6, // 3回揺れる
                duration: 120,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    this.tweens.add({
                        targets: droppedAnimal,
                        x: this.shadow!.x,
                        y: this.shadow!.y,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            // 不正解の動物をフェードアウトして消す
                            this.animals.forEach(animal => {
                                if (animal !== droppedAnimal) {
                                    this.tweens.add({
                                        targets: animal,
                                        alpha: 0,
                                        duration: 800,
                                        ease: 'Power2',
                                        onComplete: () => {
                                            animal.destroy();  // フェードアウト後に削除
                                        }
                                    });
                                }
                            });
    
                            // 0.5秒後に動物と影を中央に移動
                            this.time.delayedCall(500, () => {
                                this.shadow?.destroy();
    
                                this.tweens.add({
                                    targets: droppedAnimal,
                                    x: this.scale.width / 2,
                                    y: this.scale.height / 2,
                                    duration: 800,
                                    ease: 'Power2',
                                    onComplete: () => {
                                        // 1秒後に左へぴょんぴょんと移動して画面の外へ消える
                                        this.time.delayedCall(1000, () => {
                                            this.tweens.add({
                                                targets: droppedAnimal,
                                                x: -droppedAnimal.width,  // 画面の左外へ移動
                                                yoyo: false, // 左右には揺れないようにする
                                                duration: 1500,
                                                ease: 'Sine.easeInOut',
                                                onComplete: () => {
                                                    droppedAnimal.destroy();  // 完全に消す

                                                    this.time.delayedCall(1500, () => {
                                                        // 新しい問題を開始する
                                                        this.startNewRound();
                                                    });
                                                }
                                            });
    
                                            // 同じ動物を3匹右側から生成して左へ移動させる
                                            for (let i = 0; i < 5; i++) {
                                                const cloneAnimal = this.add.image(this.scale.width + droppedAnimal.width, this.scale.height / 3 + Phaser.Math.Between(0, 4) * (this.scale.height / 8), droppedAnimal.texture.key);
                                                cloneAnimal.setDisplaySize(droppedAnimal.width, droppedAnimal.height);
                                                cloneAnimal.setDepth(droppedAnimal.depth);
    
                                                this.tweens.add({
                                                    targets: cloneAnimal,
                                                    x: -cloneAnimal.width,  // 左外へ移動
                                                    duration: 1500,
                                                    delay: i * 240,  // 順番に動き始めるように遅延を追加
                                                    ease: 'Sine.easeInOut',
                                                    onComplete: () => {
                                                        cloneAnimal.destroy();  // 完全に消す
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        } else {
            // 不正解の場合、動物をガタガタと揺れた後にフェードアウトして消す
            this.time.delayedCall(1600, () => {
                this.wrongSound!.play(); // 不正解の音を再生
            });
    
            this.tweens.add({
                targets: droppedAnimal,
                y: `+=10`, // 右に10px
                yoyo: true,
                repeat: 6, // 3回揺れる
                duration: 120,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    this.tweens.add({
                        targets: droppedAnimal,
                        alpha: 0,
                        duration: 800,
                        ease: 'Power2',
                        onComplete: () => {
                            droppedAnimal.destroy();  // フェードアウト後に削除
                        }
                    });
                }
            });
        }
    }
    
    startNewRound() {
        // 新しい動物のセットアップ
        const newAnimals = ['elephant', 'lion', 'hippo'];
        Phaser.Utils.Array.Shuffle(newAnimals);
    
        const isLandscape = this.scale.width > this.scale.height;
        const animalWidth = isLandscape ? this.scale.width * 0.8 / 3 : this.scale.width * 0.8 / 2;
    
        const positionsX = isLandscape
            ? [
                  this.scale.width / 6,  // 左
                  this.scale.width / 2,  // 中央
                  (this.scale.width * 5) / 6  // 右
              ]
            : [
                  this.scale.width * 1 / 4,  // 左
                  this.scale.width / 2,  // 中央
                  this.scale.width * 3 / 4  // 右
              ];
    
        const positionsY = isLandscape
            ? [this.scale.height * 3 / 4, this.scale.height * 3 / 4, this.scale.height * 3 / 4] // 横並び
            : [
                  this.scale.height * 6 / 8,  // 下
                  this.scale.height * 4.5 / 8,  // 上
                  this.scale.height * 6 / 8  // 下
              ];
    
        this.animals = newAnimals.map((animalKey, index) => {
            const animal = this.add.image(this.scale.width + animalWidth, positionsY[index], animalKey).setInteractive({ draggable: true });
            animal.setDisplaySize(animalWidth, animal.height * (animalWidth / animal.width));
    
            this.tweens.add({
                targets: animal,
                x: positionsX[index], // スタート時の位置に動物を配置
                duration: 1500,
                ease: 'Power2',
                onComplete: () => {
                    animal.setInteractive(); // インタラクティブ性を再設定
                }
            });
    
            return animal;
        });
    
        // 新しい影をセットアップ
        this.correctAnimalKey = newAnimals[Phaser.Math.Between(0, 2)];
        this.shadow = this.add.image(this.scale.width / 2, this.scale.height * 1.2 / 4, `shadow-${this.correctAnimalKey}`);
        this.shadow.setDisplaySize(animalWidth, this.shadow.height * (animalWidth / this.shadow.width));
    }      
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    scene: [StartScene, ShadowGame],
    backgroundColor: '#87CEEB',  // 背景色を水色に設定
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
    }
};

const game = new Phaser.Game(config);
