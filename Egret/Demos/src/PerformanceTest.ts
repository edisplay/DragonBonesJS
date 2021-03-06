namespace demosEgret {
    export class PerformanceTest extends BaseTest {
        private _addingArmature: boolean = false;
        private _removingArmature: boolean = false;
        private _text: egret.TextField = new egret.TextField();

        private _dragonBonesData: dragonBones.DragonBonesData = null;
        private _armatures: Array<dragonBones.Armature> = [];

        public constructor() {
            super();

            this._resourceConfigURL = "resource/PerformanceTest.res.json";
        }

        protected createGameScene(): void {
            //
            this._text.textAlign = egret.HorizontalAlign.CENTER;
            this._text.size = 20;
            this._text.text = "";
            this.addChild(this._text);

            this._dragonBonesData = dragonBones.EgretFactory.factory.parseDragonBonesData(RES.getRes("dragonBonesData"));
            dragonBones.EgretFactory.factory.parseTextureAtlasData(RES.getRes("textureDataA"), RES.getRes("textureA"));

            if (this._dragonBonesData) {
                this.stage.addEventListener(egret.Event.ENTER_FRAME, this._enterFrameHandler, this);
                this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._touchHandler, this);
                this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this._touchHandler, this);

                for (let i = 0; i < 100; ++i) {
                    this._addArmature();
                }

                this._resetPosition();
                this._updateText();
            } else {
                throw new Error();
            }
        }

        private _enterFrameHandler(event: egret.Event): void {
            if (this._addingArmature) {
                for (let i = 0; i < 5; ++i) {

                    this._addArmature();
                }

                this._resetPosition();
                this._updateText();
            }

            if (this._removingArmature) {
                for (let i = 0; i < 5; ++i) {

                    this._removeArmature();
                }

                this._resetPosition();
                this._updateText();
            }

            dragonBones.WorldClock.clock.advanceTime(-1);
        }

        private _touchHandler(event: egret.TouchEvent): void {
            switch (event.type) {
                case egret.TouchEvent.TOUCH_BEGIN:
                    const touchRight = event.stageX > this.stage.stageWidth * 0.5;
                    this._addingArmature = touchRight;
                    this._removingArmature = !touchRight;
                    break;

                case egret.TouchEvent.TOUCH_END:
                    this._addingArmature = false;
                    this._removingArmature = false;
                    break;
            }
        }

        private _addArmature(): void {
            const armature = dragonBones.EgretFactory.factory.buildArmature("DragonBoy");
            const armatureDisplay = <dragonBones.EgretArmatureDisplay>armature.display;

            armatureDisplay.scaleX = armatureDisplay.scaleY = 0.7;
            this.addChild(armatureDisplay);

            armature.cacheFrameRate = 24;
            const animationName = "walk";
            //const animationName = armature.animation.animationNames[Math.floor(Math.random() * armature.animation.animationNames.length)];
            armature.animation.play(animationName, 0);
            dragonBones.WorldClock.clock.add(armature);

            this._armatures.push(armature);
        }

        private _removeArmature(): void {
            if (this._armatures.length == 0) {
                return;
            }

            const armature = this._armatures.pop();
            const armatureDisplay = <dragonBones.EgretArmatureDisplay>armature.display;
            this.removeChild(armatureDisplay);
            dragonBones.WorldClock.clock.remove(armature);
            armature.dispose();
        }

        private _resetPosition(): void {
            const count = this._armatures.length;
            if (!count) {
                return;
            }

            const paddingH = 50;
            const paddingV = 150;
            const gapping = 100;

            const stageWidth = this.stage.stageWidth - paddingH * 2;
            const columnCount = Math.floor(stageWidth / gapping);
            const paddingHModify = (this.stage.stageWidth - columnCount * gapping) * 0.5;

            const dX = stageWidth / columnCount;
            const dY = (this.stage.stageHeight - paddingV * 2) / Math.ceil(count / columnCount);

            for (let i = 0, l = this._armatures.length; i < l; ++i) {
                const armature = this._armatures[i];
                const armatureDisplay = <dragonBones.EgretArmatureDisplay>armature.display;
                const lineY = Math.floor(i / columnCount);

                armatureDisplay.x = (i % columnCount) * dX + paddingHModify;
                armatureDisplay.y = lineY * dY + paddingV;
            }
        }

        private _updateText(): void {
            this._text.x = 0;
            this._text.y = this.stage.stageHeight - 60;
            this._text.width = this.stage.stageWidth;
            this._text.text = "Count: " + this._armatures.length + " \nTouch screen left to decrease count / right to increase count.";
        }
    }
}