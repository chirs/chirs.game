var arcadeSound = {
    context: null,
    muted: false,
    voices: [],
    nextThrust: 0,

    unlock: function() {
        if (this.muted) return;
        var Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        if (!this.context) {
            this.context = new Audio();
            this.master = this.context.createGain();
            this.master.gain.value = .18;
            var compressor = this.context.createDynamicsCompressor();
            compressor.threshold.value = -12;
            compressor.knee.value = 12;
            compressor.ratio.value = 8;
            this.master.connect(compressor);
            compressor.connect(this.context.destination);
            this.noise = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
            var samples = this.noise.getChannelData(0);
            for (var i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        }
        if (this.context.state === "suspended") this.context.resume().catch(function() {});
    },

    setMuted: function(muted) {
        this.muted = muted;
        this.stop();
        if (this.master) this.master.gain.value = muted ? 0 : .18;
    },

    stop: function() {
        this.voices.slice().forEach(function(voice) { voice.stop(); });
        this.nextThrust = 0;
    },

    voice: function(source, duration, volume, delay, filter) {
        if (this.voices.length >= 24) return;
        var sound = this;
        var start = this.context.currentTime + (delay || 0);
        var gain = this.context.createGain();
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + .004);
        gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
        source.connect(filter || gain);
        if (filter) filter.connect(gain);
        gain.connect(this.master);
        var voice = {
            stop: function() {
                source.onended = null;
                source.stop();
                source.disconnect();
                if (filter) filter.disconnect();
                gain.disconnect();
                sound.voices.splice(sound.voices.indexOf(voice), 1);
            }
        };
        source.onended = function() {
            source.disconnect();
            if (filter) filter.disconnect();
            gain.disconnect();
            sound.voices.splice(sound.voices.indexOf(voice), 1);
        };
        this.voices.push(voice);
        source.start(start);
        source.stop(start + duration + .01);
    },

    tone: function(type, frequency, end, duration, volume, delay) {
        var source = this.context.createOscillator();
        var start = this.context.currentTime + (delay || 0);
        source.type = type;
        source.frequency.setValueAtTime(frequency, start);
        source.frequency.exponentialRampToValueAtTime(end, start + duration);
        this.voice(source, duration, volume, delay);
    },

    crack: function(duration, volume, frequency) {
        var source = this.context.createBufferSource();
        source.buffer = this.noise;
        var filter = this.context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = frequency;
        this.voice(source, duration, volume, 0, filter);
    },

    play: function(name, value) {
        if (this.muted || !this.context || this.context.state !== "running") return;
        if (name === "death") this.stop();
        if (this.voices.length >= 24) return;
        if (name === "pickup") {
            var pitch = 330 * Math.pow(2, (value - 16) / 24);
            this.tone("triangle", pitch, pitch * 1.5, .1, .7);
        } else if (name === "wave") {
            this.tone("triangle", 523, 523, .16, .55);
            this.tone("triangle", 659, 659, .16, .55, .09);
            this.tone("triangle", 784, 1047, .25, .5, .18);
        } else if (name === "death") {
            this.crack(.25, .7, 1800);
            this.tone("sawtooth", 100, 25, .32, .35);
        } else if (name === "shot") {
            this.tone("square", 880, 140, .085, .2);
        } else if (name === "asteroid") {
            this.crack(.07 + value * .035, .5, 600);
            this.tone("triangle", 160 / value, 30, .18, .6);
        } else if (name === "thrust") {
            if (this.context.currentTime < this.nextThrust) return;
            this.nextThrust = this.context.currentTime + .07;
            this.crack(.06, .13, 400);
            this.tone("sawtooth", 45 + Math.random() * 25, 30, .065, .12);
        } else if (name === "paddle") {
            this.tone("sine", 220, 330, .11, .8);
        } else if (name === "brick") {
            var notes = [523, 659, 784, 1047];
            var note = notes[Math.max(0, Math.min(3, Math.round((value - 90) / 23)))];
            this.tone("triangle", note, note, .13, .7);
        } else if (name === "serve") {
            this.tone("sine", 330, 660, .12, .6);
        } else if (name === "miss") {
            this.tone("triangle", 220, 70, .22, .6);
        }
    }
};
