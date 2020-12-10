<template>
    <div id="app">
        <div class="game-board">
            <div class="buttons" :class="{'activeInputState': activeInputState}">
                <div class="button green" :class="{'active': activeButton === 1 && running}" @click="handleButtonClick(1)"></div>
                <div class="button red" :class="{'active': activeButton === 2 && running}" @click="handleButtonClick(2)"></div>
                <div class="button yellow" :class="{'active': activeButton === 3 && running}" @click="handleButtonClick(3)"></div>
                <div class="button blue" :class="{'active': activeButton === 4 && running}" @click="handleButtonClick(4)"></div>
            </div>
            <div class="controls">
                <div class="container">
                    <div class="controls__buttons">
                        <div class="controls__wrapper">
                            <div class="display" :class="{'active': active}">{{getActiveCount}}</div>
                            <div class="push-button start" :class="{'active': running}" @click="toggleRunning"></div>
                        </div>
                        <form class="controls__level">
                            <template v-for="level in levels">
                                <label :for="level.name" :class="{'active': activeLevel === level.name}" @click="levelRadioClick(level.name, level.interval)">{{level.name}}
                                    <input type="radio" :value="level.interval" v-model="activeInterval">
                                </label>
                            </template>
                        </form>
                        <div class="switch-button" :class="{'active': active}" @click="toggleActive"></div>
                    </div>
                </div>
            </div>
            <div class="message-overlay success" v-show="message==='success'" @click="message=null">
                <h2>Congratulations!</h2>
                <p>You have a good memory!</p>
            </div>
            <div class="message-overlay warning" v-show="message==='warning'" @click="message=null">
                <h2>Failed!</h2>
                <p>Click here to try again.</p>
            </div>
            <div class="hide">
                <audio v-for="(sound, index) in sounds" :ref="'sound' + index">
                    <source :src="sound" type="audio/mpeg">
                </audio>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'App',
        data() {
            return {
                active: false,
                running: false,
                activeInputState: false,
                series: [],
                inputSeries: [],
                activeCount: 1,
                targetCount: 10,
                activeButton: null,
                timeouts: [],
                waitForInput: null,
                message: '',
                levels: [
                    { name: 'Low', interval: 1500 },
                    { name: 'Normal', interval: 1000 },
                    { name: 'Hard', interval: 400 },
                ],
                activeInterval: null,
                activeLevel: null,
                sounds: {
                    1: 'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3',
                    2: 'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3',
                    3: 'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3',
                    4: 'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'
                }
            }
        },
        created () {},
        mounted () {},
        watch: {
            'message' (newVal, oldVal) {
                if (oldVal === 'warning' && newVal === null) {
                    this.displaySeries();
                }
            },
            'active' () {
                this.running = false;
                this.activeInputState = false;
            },
            'running' (val) {
                this.activeCount = 1;
                if (val) {
                    this.startGame();
                } else {
                    this.timeouts.forEach((item) => {
                        clearTimeout(item);
                    })
                }
                this.activeInputState = false;
            }
        },
        computed: {
            getActiveCount () {
                return (this.active && this.running) ? this.activeCount < 10 ? '0' + this.activeCount : this.activeCount : '--';
            }
        },
        methods: {
            playSound: function (id) {
                this.$refs['sound' + id][0].play();
            },
            handleButtonClick (button) {
                if (!this.activeInputState) return;
                clearTimeout(this.waitForInput);

                this.playSound(button);

                let index = this.inputSeries.length;

                if (this.series[index] === button) {
                    this.inputSeries.push(button);
                    this.waitForInput = setTimeout(() => {
                        this.message = 'warning';
                    }, 5000);
                } else {
                    this.message = 'warning';
                }

                if (this.inputSeries.length === this.activeCount) {
                    if (this.activeCount === this.targetCount) {
                        this.message = 'success';
                        this.running = false;
                        clearTimeout(this.waitForInput);
                    } else {
                        this.activeCount++;
                        this.displaySeries();
                    }
                }
            },
            levelRadioClick(name, interval){
                if(this.active && !this.running) {
                    this.activeInterval = interval;
                    this.activeLevel = name;
                }
            },
            displaySeries () {
                this.activeInputState = false;
                this.inputSeries = [];
                this.timeouts = [];
                clearTimeout(this.waitForInput);

                for (let i = 0; i < this.activeCount; i++) {
                    let tmp = i;

                    let to = setTimeout(() => {
                        this.activeButton = this.series[tmp];
                        this.playSound(this.activeButton);
                        setTimeout(() => {
                            this.activeButton = null;
                            if (tmp === this.activeCount - 1) {
                                this.activeInputState = true;
                                clearTimeout(this.waitForInput);
                                this.waitForInput = setTimeout(() => {
                                    this.message = 'warning';
                                }, 5000);
                            }
                        }, 500);
                    }, 500 + (i * this.activeInterval));

                    this.timeouts.push(to);
                }
            },
            startGame () {
                this.generateSeries();
                this.displaySeries();
            },
            generateSeries () {
                this.series = [];
                for (let i = 0; i < this.targetCount; i++) {
                    this.series.push(Math.floor((Math.random() * 4) + 1));
                }
            },
            toggleActive () {
                this.active = !this.active;
                clearTimeout(this.waitForInput);
                if(this.active) {
                    this.activeLevel = this.levels[0].name;
                    this.activeInterval = this.levels[0].interval;
                } else {
                    this.activeLevel = null;
                    this.activeInterval = null;
                }
            },
            toggleRunning () {
                if (!this.active) return;
                this.running = !this.running;
                clearTimeout(this.waitForInput);
            },
        }
    }
</script>

<style lang="sass">
    *
        margin: 0
        padding: 0

    body
        color: white
        font-family: sans-serif, cursive
        text-align: center
        background-color: #3e50b4
        //background-color: #263238

        /*Main board*/

        .game-board
            width: 390px
            height: 390px
            margin: 7.5% auto
            padding: 25px
            background-color: #212121
            border-radius: 50%
            position: relative
            box-shadow: 0 0 10px #222
            overflow: hidden

            .message-overlay
                position: absolute
                top: 0
                left: 0
                width: 100%
                height: 100%
                padding-top: 25%
                font-size: 1.4em

                &.warning
                    background-color: rgba(254, 87, 34, 0.9)

                &.success
                    background-color: rgba(76, 175, 80, 0.9)

            /* Game background color buttons */

            .buttons
                width: 100%
                height: 100%
                overflow: hidden
                border-radius: 50%
                position: relative

                &.activeInputState .button
                    cursor: pointer

                    &:hover
                        opacity: 0.75

                    &:active
                        opacity: 1

                .button
                    position: absolute
                    height: 48%
                    width: 48%
                    opacity: 0.5
                    transition: background 0.25s ease-out

                    &.green
                        background-color: #4bae4f

                    &.red
                        background-color: #f34236
                        top: 0
                        right: 0

                    &.blue
                        background-color: #2196f3
                        bottom: 0
                        right: 0

                    &.yellow
                        background-color: #fcbf07
                        bottom: 0
                        left: 0

                    /*active state*/

                    &.active
                        opacity: 1

                    &.green.active
                        background-color: #8bc34a

                    &.red.active
                        background-color: #ff5722
                        top: 0
                        right: 0

                    &.blue.active
                        background-color: #64b5f6
                        bottom: 0
                        right: 0

                    &.yellow.active
                        background-color: #fce83a
                        bottom: 0
                        left: 0

            /*Game menu controls*/

            .controls
                width: 50%
                height: 50%
                position: absolute
                margin: 0 auto
                left: 0
                right: 0
                top: 25%
                bottom: 25%
                background-color: #212121
                border-radius: 50%
                color: #212121

                .container
                    position: relative
                    width: 80%
                    height: 80%
                    margin: 0 auto
                    top: 6%
                    padding: 4%
                    background-color: #fefefe
                    border-radius: 50%
                    text-align: center

                    .controls__buttons
                        position: relative
                        display: flex
                        flex-direction: column
                        justify-content: space-between
                        padding: 0 10%

                        .controls__wrapper
                            position: relative
                            display: flex
                            flex-direction: row
                            justify-content: space-between

                            .display
                                padding: 5px 10px
                                background-color: #263238
                                box-shadow: inset 0 0 15px #000
                                letter-spacing: 3px
                                font-size: 22px
                                font-weight: bold
                                float: left
                                margin: 20% 4.5%
                                position: relative
                                width: 42px


                                &.active
                                    color: #f44336

                                &:before
                                    content: 'Count'
                                    position: absolute
                                    bottom: -50%
                                    left: 0
                                    width: 100%
                                    height: 16px
                                    text-align: center
                                    font-weight: normal
                                    font-size: 15px
                                    letter-spacing: 1px
                                    color: #222

                            .push-button
                                width: 26px
                                height: 26px
                                border-radius: 50%
                                border: 5px solid #263238
                                position: relative
                                float: left
                                margin: 20% 4.5%
                                box-shadow: 0 1px 2px #222
                                cursor: pointer
                                transition: all 0.25s ease-out

                                &:hover
                                    box-shadow: 0 1px 7px #222

                                &:active
                                    box-shadow: 0 1px 2px #222

                                &.start
                                    background-color: #f44336

                                    &:after
                                        content: 'Start'
                                        position: absolute
                                        bottom: -90%
                                        left: -5px
                                        width: 16px
                                        height: 16px
                                        font-size: 15px
                                        text-align: center
                                        letter-spacing: 1px

                                &::before
                                    content: ""
                                    position: absolute
                                    top: -20px
                                    left: 0
                                    right: 0
                                    margin: 0 auto
                                    width: 10px
                                    height: 10px
                                    border: 1px solid #263238
                                    background-color: #263238
                                    border-radius: 50%
                                    transition: all 0.25s ease-out

                                &.active::before
                                    background-color: #f34236

                        .controls__level
                            display: flex
                            justify-content: center
                            flex-flow: row nowrap

                            label
                                display: flex
                                align-content: center
                                justify-content: center
                                cursor: pointer
                                transition: all 0.2s ease-in
                                font-size: 16px
                                width: 55px
                                margin: 0 2px

                                &:hover
                                    background-color: rgba(100,181,246, 0.9)

                                &.active
                                    background-color: rgba(75,174,79, 0.8)

                                input
                                    display: none

                        .switch-button
                            margin: 10px auto
                            clear: both
                            display: block
                            width: 50%
                            border: 5px solid #263238
                            background-color: #263238
                            position: relative
                            height: 16px
                            cursor: pointer
                            transition: all 0.25s ease-out

                            &::before
                                content: ""
                                position: absolute
                                top: 0
                                left: 0
                                width: 50%
                                height: 16px
                                background-color: #eee

                            &.active::before
                                left: auto
                                right: 0
                                background-color: #2196f3

                            &:after
                                content: 'Power'
                                position: absolute
                                bottom: -140%
                                left: 0
                                width: 100%
                                height: 16px
                                text-align: center
                                font-weight: normal
                                font-size: 15px
                                letter-spacing: 1px
</style>