function getMediaStreamAudioTracks(mediaSource) {
    return mediaSource.MediaStreams.filter(function (s) {
        return s.Type === 'Audio';
    });
}

function getMediaStreamTextTracks(mediaSource) {
    return mediaSource.MediaStreams.filter(function (s) {
        return s.Type === 'Subtitle';
    });
}

function _AvplayVideoPlayer(modules) {
    console.debug('AVPlay Video Player');

    window['AvplayVideoPlayer'] = this;

    this.appRouter = modules.appRouter;
    this.Events = modules.events;
    this.loading = modules.loading;

    // playbackManager needs this
    this.name = "AVPlay Video Player";
    this.type = 'mediaplayer';
    this.id = 'avplay-video';
    this.isLocalPlayer = true;
    // Required by Jellyfin Web 12.4's subtitle menu.
    this.supports = function (feature) { return false; };
    //this.lastPlayerData = {}; // FIXME: need?

    this._currentPlayOptions = {};
    this._currentTrackOffset = 0;

    this.canPlayMediaType = function (mediaType) {
        return (mediaType || '').toLowerCase() === 'video';
    };

    this.supportsPlayMethod = function (playMethod, item) {
        return true;
    };

    this.getDeviceProfile = function (item, options) {
        var profile = {
            Name: this.name + ' Profile',

            MaxStreamingBitrate: 120000000,
            MaxStaticBitrate: 100000000,
            MusicStreamingTranscodingBitrate: 384000,

            CodecProfiles: [
                {
                    Codec: 'h264',
                    Conditions: [
                        {
                            Condition: 'NotEquals',
                            IsRequired: false,
                            Property: 'IsAnamorphic',
                            Value: 'true'
                        },
                        {
                            Condition: 'EqualsAny',
                            IsRequired: false,
                            Property: 'VideoProfile',
                            Value: 'high|main|baseline|constrained baseline|high 10'
                        },
                        {
                            Condition: 'LessThanEqual',
                            IsRequired: false,
                            Property: 'VideoLevel',
                            Value: '51'
                        }
                    ],
                    Type: 'Video'
                },
                {
                    Codec: 'hevc',
                    Conditions: [
                        {
                            Condition: 'NotEquals',
                            IsRequired: false,
                            Property: 'IsAnamorphic',
                            Value: 'true'
                        },
                        {
                            Condition: 'EqualsAny',
                            IsRequired: false,
                            Property: 'VideoProfile',
                            Value: 'main|main 10'
                        },
                        {
                            Condition: 'LessThanEqual',
                            IsRequired: false,
                            Property: 'VideoLevel',
                            Value: '183'
                        }
                    ],
                    Type: 'Video'
                }
            ],

            DirectPlayProfiles: [
                {
                    Container: 'webm',
                    AudioCodec: 'vorbis,opus',
                    VideoCodec: 'vp8,vp9',
                    Type: 'Video'
                },
                {
                    Container: 'mp4,m4v',
                    AudioCodec: 'aac,mp3,ac3,eac3,mp2,pcm_s16le,pcm_s24le,aac_latm,opus,flac,vorbis',
                    VideoCodec: 'h264,hevc,mpeg2video,vc1,msmpeg4v2,vp8,vp9',
                    Type: 'Video'
                },
                {
                    Container: 'mkv',
                    AudioCodec: 'aac,mp3,ac3,eac3,mp2,pcm_s16le,pcm_s24le,aac_latm,opus,flac,vorbis',
                    VideoCodec: 'h264,hevc,mpeg2video,vc1,msmpeg4v2,vp8,vp9',
                    Type: 'Video'
                },
                {
                    Container: 'm2ts',
                    AudioCodec: 'aac,mp3,ac3,eac3,mp2,pcm_s16le,pcm_s24le,aac_latm,opus,flac,vorbis',
                    VideoCodec: 'h264,vc1,mpeg2video',
                    Type: 'Video'
                },
                {
                    Container: 'wmv',
                    Type: 'Video'
                },
                {
                    Container: 'ts,mpegts',
                    AudioCodec: 'aac,mp3,ac3,eac3,mp2,pcm_s16le,pcm_s24le,aac_latm,opus,flac,vorbis',
                    VideoCodec: 'h264,hevc,vc1,mpeg2video',
                    Type: 'Video'
                },
                {
                    Container: 'asf',
                    Type: 'Video'
                },
                {
                    Container: 'avi',
                    AudioCodec: 'aac,mp3,ac3,eac3,mp2,pcm_s16le,pcm_s24le,aac_latm,opus,flac,vorbis',
                    VideoCodec: 'h264,hevc',
                    Type: 'Video'
                },
                {
                    Container: 'mpg,mpeg,flv,3gp,mts,trp,vob,vro',
                    AudioCodec: 'aac,mp3,ac3,eac3,mp2,pcm_s16le,pcm_s24le,aac_latm,opus,flac,vorbis',
                    Type: 'Video'
                },
                {
                    Container: 'mov',
                    AudioCodec: 'aac,mp3,ac3,eac3,mp2,pcm_s16le,pcm_s24le,aac_latm,opus,flac,vorbis',
                    VideoCodec: 'h264',
                    Type: 'Video'
                },
                {
                    Container: 'opus,mp3,aac,m4a,m4b,flac,webma,wma,wav,ogg',
                    Type: 'Audio'
                },
                {
                    Container: 'webm',
                    AudioCodec: 'opus,webma',
                    Type: 'Audio'
                },
            ],

            ResponseProfiles: [
                {
                    Container: 'm4v',
                    MimeType: 'video/mp4',
                    Type: 'Video'
                }
            ],

            SubtitleProfiles: [
                {
                    Format: 'vtt',
                    Method: 'External'
                },
                {
                    Format: 'ass',
                    Method: 'External'
                },
                {
                    Format: 'ssa',
                    Method: 'External'
                }
            ],

            TranscodingProfiles: [{
                Container: "aac",
                Type: 'Audio',
                VideoCodec: "",
                AudioCodec: "aac",
                Protocol: "hls",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Streaming',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 1,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "aac",
                Type: 'Audio',
                VideoCodec: "",
                AudioCodec: "aac",
                Protocol: "http",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Streaming',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "mp3",
                Type: 'Audio',
                VideoCodec: "",
                AudioCodec: "mp3",
                Protocol: "http",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Streaming',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "opus",
                Type: 'Audio',
                VideoCodec: "",
                AudioCodec: "opus",
                Protocol: "http",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Streaming',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "wav",
                Type: 'Audio',
                VideoCodec: "",
                AudioCodec: "wav",
                Protocol: "http",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Streaming',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "opus",
                Type: 'Audio',
                VideoCodec: "",
                AudioCodec: "opus",
                Protocol: "http",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Static',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "mp3",
                Type: 'Audio',
                VideoCodec: "",
                AudioCodec: "mp3",
                Protocol: "http",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Static',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "aac",
                Type: 'Audio',
                VideoCodec: "",
                AudioCodec: "aac",
                Protocol: "http",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Static',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "wav",
                Type: 'Audio',
                VideoCodec: "",
                AudioCodec: "wav",
                Protocol: "http",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Static',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "mkv",
                Type: 'Video',
                VideoCodec: "h264,hevc,mpeg2video,vc1,msmpeg4v2,vp8,vp9",
                AudioCodec: "aac,mp3,ac3,eac3,mp2,pcm_s16le,pcm_s24le,aac_latm,opus,flac,vorbis",
                Protocol: "",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: true,
                Context: 'Static',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "ts",
                Type: 'Video',
                VideoCodec: "h264,hevc",
                AudioCodec: "aac,mp3,ac3,eac3,opus",
                Protocol: "hls",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Streaming',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 1,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "webm",
                Type: 'Video',
                VideoCodec: "vpx",
                AudioCodec: "vorbis",
                Protocol: "http",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Streaming',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: "6",
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }, {
                Container: "mp4",
                Type: 'Video',
                VideoCodec: "h264",
                AudioCodec: "aac,mp3,ac3,eac3,mp2,pcm_s16le,pcm_s24le,aac_latm,opus,flac,vorbis",
                Protocol: "http",
                EstimateContentLength: false,
                EnableMpegtsM2TsMode: false,
                TranscodeSeekInfo: 'Auto',
                CopyTimestamps: false,
                Context: 'Static',
                EnableSubtitlesInManifest: false,
                MaxAudioChannels: null,
                MinSegments: 0,
                SegmentLength: 0,
                BreakOnNonKeyFrames: false
            }]
        };

        return Promise.resolve(profile);
    }


    // External text subtitles are rendered above AVPlay's HDR video plane.
    this._subEvents = null;
    this._subOverlay = null;
    this._subOverlayContainer = null;
    this._subSettingsSignature = null;
    this._subRequest = 0;
    this._subText = '';
    this.clearSubOverlay = function () {
        this._subRequest++;
        this._subEvents = null;
        this._subText = '';
        if (this._subOverlayContainer && this._subOverlayContainer.parentNode) {
            this._subOverlayContainer.parentNode.removeChild(this._subOverlayContainer);
        }
        this._subOverlayContainer = null;
        this._subOverlay = null;
        this._subSettingsSignature = null;
    };
    this.applySubAppearance = function () {
        if (!this._subOverlay || !this._subOverlayContainer) return;

        // Matches UserSettings.getSubtitleAppearanceSettings() / AppSettings.get()
        // in Jellyfin Web v12.4 (per-user localStorage key).
        var userId = '';
        var raw = null;
        var key = 'localplayersubtitleappearance3';
        try {
            if (window.ApiClient && typeof window.ApiClient.getCurrentUserId === 'function') {
                userId = window.ApiClient.getCurrentUserId() || '';
            }
            if (userId) key = userId + '-' + key;
            raw = window.localStorage.getItem(key);
            if (raw == null && userId) raw = window.localStorage.getItem('localplayersubtitleappearance3');
        } catch (e) {
            console.warn('[OSA subtitles] Unable to read appearance settings:', e);
        }
        var signature = key + ':' + raw;
        if (signature === this._subSettingsSignature) return;
        this._subSettingsSignature = signature;

        var settings = {};
        try {
            settings = JSON.parse(raw || '{}') || {};
        } catch (e) {
            console.warn('[OSA subtitles] Invalid appearance JSON:', e);
        }

        var text = this._subOverlay.style;
        var frame = this._subOverlayContainer.style;
        // Match subtitleappearancehelper.js and the 170% .videoSubtitles base.
        switch (settings.textSize || '') {
            case 'smaller': text.fontSize = '.8em'; break;
            case 'small': text.fontSize = 'inherit'; break;
            case 'large': text.fontSize = '1.72em'; break;
            case 'larger': text.fontSize = '2em'; break;
            case 'extralarge': text.fontSize = '2.2em'; break;
            default: text.fontSize = '1.36em'; break;
        }
        text.fontWeight = settings.textWeight === 'bold' ? 'bold' : 'normal';
        text.color = settings.textColor || '#ffffff';
        text.backgroundColor = settings.textBackground || 'transparent';

        switch (settings.font || '') {
            case 'typewriter':
                text.fontFamily = '"Courier New",monospace';
                text.fontVariant = 'none';
                break;
            case 'print':
                text.fontFamily = 'Georgia,Times New Roman,Arial,Helvetica,serif';
                text.fontVariant = 'none';
                break;
            case 'console':
                text.fontFamily = 'Consolas,Lucida Console,Menlo,Monaco,monospace';
                text.fontVariant = 'none';
                break;
            case 'cursive':
                text.fontFamily = 'Lucida Handwriting,Brush Script MT,Segoe Script,cursive,Quintessential,system-ui,-apple-system,BlinkMacSystemFont,sans-serif';
                text.fontVariant = 'none';
                break;
            case 'casual':
                text.fontFamily = 'Gabriola,Segoe Print,Comic Sans MS,Chalkboard,Short Stack,system-ui,-apple-system,BlinkMacSystemFont,sans-serif';
                text.fontVariant = 'none';
                break;
            case 'smallcaps':
                text.fontFamily = 'Copperplate Gothic,Copperplate Gothic Bold,Copperplate,system-ui,-apple-system,BlinkMacSystemFont,sans-serif';
                text.fontVariant = 'small-caps';
                break;
            default:
                text.fontFamily = '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol';
                text.fontVariant = 'none';
        }

        switch (settings.dropShadow || '') {
            case 'none':
                text.textShadow = 'none';
                break;
            case 'raised':
                text.textShadow = '-0.04em -0.04em #fff, 0px -0.04em #fff, -0.04em 0px #fff, 0.04em 0.04em #000, 0px 0.04em #000, 0.04em 0px #000';
                break;
            case 'depressed':
                text.textShadow = '0.04em 0.04em #fff, 0px 0.04em #fff, 0.04em 0px #fff, -0.04em -0.04em #000, 0px -0.04em #000, -0.04em 0px #000';
                break;
            case 'uniform':
                text.textShadow = '#000 0px 0.03em, #000 0px -0.03em, #000 0px 0.05em, #000 0px -0.05em, #000 0.03em 0px, #000 -0.03em 0px, #000 0.03em 0.03em, #000 -0.03em 0.03em, #000 0.03em -0.03em, #000 -0.03em -0.03em, #000 0.03em 0.05em, #000 -0.03em 0.05em, #000 0.03em -0.05em, #000 -0.03em -0.05em, #000 0.05em 0px, #000 -0.05em 0px, #000 0.05em 0.03em, #000 -0.05em 0.03em, #000 0.05em -0.03em, #000 -0.05em -0.03em';
                break;
            default:
                text.textShadow = '#000000 0px 0px 7px';
        }

        var pos = parseInt(settings.verticalPosition, 10);
        if (!isFinite(pos)) pos = -3;
        if (pos < 0) {
            frame.top = '';
            frame.bottom = '0';
            text.marginBottom = Math.abs(pos + 1) * 1.35 + 'em';
            text.marginTop = '';
        } else {
            frame.top = '0';
            frame.bottom = '';
            text.marginTop = pos * 1.35 + 'em';
            text.marginBottom = '';
        }
        console.debug('[OSA subtitles] Applied Jellyfin appearance settings:', settings.textSize || 'normal');
    };
    this.renderSubOverlay = function (ms) {
        if (!this._subEvents || !this._subOverlay) return;
        this.applySubAppearance();
        var ticks = (Number(ms) || 0) * 10000;
        var active = [];
        for (var i = 0; i < this._subEvents.length; i++) {
            var e = this._subEvents[i];
            if (+e.StartPositionTicks > ticks) break;
            if (+e.EndPositionTicks >= ticks && e.Text) active.push(e.Text);
        }
        var value = active.join('\n').replace(/\\N/gi, '\n')
            .replace(/\{\\[^}]*\}/g, '').replace(/<\/?(?:b|i|u)>/gi, '');
        if (this._subText !== value) {
            this._subOverlay.textContent = value;
            this._subText = value;
        }
    };
    this.loadSubEvents = function (track) {
        var self = this;
        var url = track.DeliveryUrl;
        if (!url) {
            console.error('[OSA] Missing subtitle URL');
            return;
        }
        if (!track.IsExternalUrl && !/^https?:\/\//i.test(url)) url = window.ApiClient.getUrl(url);
        if (!/\.vtt(?=\?|$)/i.test(url)) {
            console.error('[OSA] Unsupported subtitle URL format');
            return;
        }
        url = url.replace(/\.vtt(?=\?|$)/i, '.js');
        var request = ++self._subRequest;
        fetch(url).then(function (r) {
            if (!r.ok) throw new Error('Subtitle HTTP ' + r.status);
            return r.json();
        }).then(function (data) {
            if (request !== self._subRequest) return;
            if (!data || !Array.isArray(data.TrackEvents)) throw new Error('Missing TrackEvents');
            self._subEvents = data.TrackEvents;
            // Reuse Jellyfin Web's subtitle layout baseline, not a fixed 28px font.
            var container = document.createElement('div');
            container.className = 'videoSubtitles osa-subtitles';
            container.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483646;' +
                'font-size:170%;display:flex;flex-direction:column;align-items:center;' +
                'text-align:center;pointer-events:none;';
            var el = document.createElement('div');
            el.className = 'videoSubtitlesInner osa-subtitles-text';
            el.style.cssText = 'max-width:70%;white-space:pre-line;line-height:1.35;' +
                'background-color:transparent;color:white;';
            container.appendChild(el);
            self._subOverlayContainer = container;
            self._subOverlay = el;
            document.body.appendChild(container);
            self.renderSubOverlay(webapis.avplay.getCurrentTime());
        }).catch(function (error) {
            if (request === self._subRequest) console.error('[OSA] Subtitle error:', error);
        });
    };

    this.play = function (options) {
        var self = this;

        return self.createMediaElement(options)
            .then(function (elem) {
                self._videoElement = elem;
                return self.setCurrentSrc(elem, options);
            })
            .then(function () {
                if (options.fullscreen) {
                    self.appRouter.showVideoOsd().then(function () {
                        self._videoElement.classList.remove('avplayVideoPlayerOnTop');
                    });
                } else {
                    self.appRouter.setTransparency('backdrop');
                    self._videoElement.classList.remove('avplayVideoPlayerOnTop');
                }

                if (options.playerStartPositionTicks) {
                    return self.currentTime(options.playerStartPositionTicks / 10000);
                }

                return Promise.resolve();
            })
            .then(function () {
                console.debug('play 1', webapis.avplay.getState());
                webapis.avplay.play();
                console.debug('play 2', webapis.avplay.getState());

                var audioIndex = options.playMethod === 'Transcode' ? null : options.mediaSource.DefaultAudioStreamIndex;
                if (audioIndex) {
                    self.setAudioStreamIndex(audioIndex);
                }

                var subtitleIndex = options.mediaSource.DefaultSubtitleStreamIndex;
                if (subtitleIndex != null && subtitleIndex >= 0) {
                    var initialSubtitleStream = getMediaStreamTextTracks(options.mediaSource).filter(function (t) { return t.Index === subtitleIndex; })[0];
                    if (initialSubtitleStream && initialSubtitleStream.DeliveryMethod !== 'Encode') {
                        self.setSubtitleStreamIndex(subtitleIndex);
                    }
                }

                self.loading.hide();

                self.Events.trigger(self, 'playing');
            });
    }

    this.stop = function (destroyPlayer) {
        this.clearSubOverlay();
        var elem = document.querySelector('.avplayVideoPlayer');

        if (elem) {
            console.debug('stop 1', webapis.avplay.getState());
            webapis.avplay.pause();
            console.debug('stop 2', webapis.avplay.getState());

            this.onEnded();

            webapis.avplay.stop();
            console.debug('stop 3', webapis.avplay.getState());
            webapis.avplay.close();
            console.debug('stop 4', webapis.avplay.getState());

            if (destroyPlayer) {
                this.destroy();
            }
        }

        this._currentPlayOptions = {};

        return Promise.resolve();
    }

    this.destroy = function () {
        this.clearSubOverlay();
        this.appRouter.setTransparency('none');
        document.body.classList.remove('hide-scroll');

        var elem = document.querySelector('.avplayVideoPlayer');

        if (elem) {
            console.debug('destroy 1', webapis.avplay.getState());
            webapis.avplay.close();
            console.debug('destroy 2', webapis.avplay.getState());
            elem.parentNode.removeChild(elem);
        }

        this._videoElement = null;
    }

    this.volume = function (val) {
        // Volume is controlled physically
        return 1.0;
    }

    this.isMuted = function () {
        // Volume is controlled physically
        return false;
    }

    this.currentSrc = function () {
        return this._currentPlayOptions.url;
    }

    this.currentTime = function (val) {
        if (val != null) {
            return new Promise(function (resolve, reject) {
                var successCallback = function () {
                    console.debug('Media seek successful');
                    resolve();
                };

                var errorCallback = function () {
                    console.debug('Media seek failed');
                    reject();
                };

                console.debug('seekTo', webapis.avplay.getState());
                webapis.avplay.seekTo(val, successCallback, errorCallback);
            });
        }

        return webapis.avplay.getCurrentTime();
    }

    this.duration = function () {
        return webapis.avplay.getDuration();
    }

    this.seekable = function () {
        return this._videoElement && webapis.avplay.getDuration() > 0;
    }

    this.paused = function () {
        return webapis.avplay.getState() === 'PAUSED';
    }

    this.pause = function () {
        webapis.avplay.pause();
        this.Events.trigger(this, 'pause');
    }

    this.unpause = function () {
        webapis.avplay.play();
        this.Events.trigger(this, 'unpause');
    }

    this.createMediaElement = function (options) {
        var elem = document.querySelector('.avplayVideoPlayer');

        if (!elem) {
            elem = document.createElement('object');
            elem.type = 'application/avplayer';
            elem.classList.add('avplayVideoPlayer');
            elem.classList.toggle('avplayVideoPlayerOnTop', options.fullscreen);
            document.body.insertBefore(elem, document.body.children[0]);
        }

        if (options.fullscreen) {
            document.body.classList.add('hide-scroll');
        }

        return Promise.resolve(elem);
    }

    this.setCurrentSrc = function (elem, options) {
        var self = this;
        self.clearSubOverlay();

        return new Promise(function (resolve, reject) {
            var listener = {
                onbufferingstart: function () {
                    console.debug("Buffering start.");
                },
 
                onbufferingprogress: function (percent) {
                    console.debug("Buffering progress data : " + percent);
                },

                onbufferingcomplete: function () {
                    console.debug("Buffering complete.");
                },
 
                onstreamcompleted: function () {
                    console.debug('onstreamcompleted');
                    self.onEnded();
                },

                oncurrentplaytime: function (ms) {
                    self.Events.trigger(self, 'timeupdate');
                    self.renderSubOverlay(ms);
                },

                onerror: function (eventType) {
                    console.debug("event type error : " + eventType);
                    reject(eventType);
                },

                onevent: function (eventType, eventData) {
                    console.debug("event type: " + eventType + ", data: " + eventData);
                },

                onsubtitlechange: function (duration, text, data3, data4) {
                    console.debug("subtitleText: " + text);
                },

                ondrmevent: function (drmEvent, drmData) {
                    console.debug("DRM callback: " + drmEvent + ", data: " + drmData);
                }
            };

            self._currentPlayOptions = options;

            console.debug('setCurrentSrc 1', webapis.avplay.getState());
            webapis.avplay.close();
            console.debug('setCurrentSrc 2', webapis.avplay.getState());
            webapis.avplay.open(options.url);
            console.debug('setCurrentSrc 3', webapis.avplay.getState());

            // HACK: Wait more - doesn't help
            webapis.avplay.setTimeoutForBuffering(60);

            webapis.avplay.setListener(listener);

            webapis.avplay.setDisplayRect(elem.offsetLeft, elem.offsetTop, elem.offsetWidth, elem.offsetHeight);

            webapis.avplay.prepareAsync(resolve, reject);
        });
    }

    this.canSetAudioStreamIndex = function () {
        return true;
    }

    this.setAudioStreamIndex = function (streamIndex) {
        var self = this;

        console.debug('setting new audio track index to: ' + streamIndex);

        var audioIndex = -1;

        if (streamIndex !== -1) {
            var audioTracks = getMediaStreamAudioTracks(self._currentPlayOptions.mediaSource);

            console.debug('AudioTracks:', audioTracks);

            for (var i = 0; i < audioTracks.length; i++) {
                var track = audioTracks[i];

                if (track.Index === streamIndex) {
                    audioIndex = i;
                    break;
                }
            }
        }

        if (audioIndex === -1) {
            return;
        }

        var audioTracks = webapis.avplay.getTotalTrackInfo().filter(function (t) {
            return t.type === 'AUDIO';
        });

        console.debug('AudioTracks:', audioTracks);

        if (audioIndex < audioTracks.length) {
            var track = audioTracks[audioIndex];

            webapis.avplay.setSelectTrack('AUDIO', track.index);
        } else {
            console.error('[setAudioStreamIndex] Out of bound');
        }
    }

    this.setSubtitleStreamIndex = function (streamIndex) {
        this.clearSubOverlay();
        if (streamIndex == null || streamIndex === -1) {
            webapis.avplay.setSilentSubtitle(true);
            return;
        }
        var subtitles = getMediaStreamTextTracks(this._currentPlayOptions.mediaSource);
        var selected = subtitles.filter(function (t) { return t.Index === streamIndex; })[0];
        if (!selected) {
            console.error('[OSA] Subtitle stream not found:', streamIndex);
            return;
        }
        if (selected.DeliveryMethod === 'External') {
            webapis.avplay.setSilentSubtitle(true);
            this.loadSubEvents(selected);
        } else if (selected.DeliveryMethod === 'Embed' ||
                   (!selected.DeliveryMethod && !selected.IsExternal)) {
            var embedded = subtitles.filter(function (t) {
                return t.DeliveryMethod === 'Embed' || (!t.DeliveryMethod && !t.IsExternal);
            });
            var ordinal = -1;
            for (var n = 0; n < embedded.length; n++) {
                if (embedded[n].Index === streamIndex) { ordinal = n; break; }
            }
            var nativeTexts = webapis.avplay.getTotalTrackInfo().filter(function (t) {
                return t.type === 'TEXT';
            });
            if (ordinal < 0 || !nativeTexts[ordinal]) {
                console.error('[OSA] Native TEXT track not found:', streamIndex);
                return;
            }
            webapis.avplay.setSilentSubtitle(false);
            webapis.avplay.setSelectTrack('TEXT', nativeTexts[ordinal].index);
        } else {
            console.error('[OSA] Unsupported subtitle delivery method:', selected.DeliveryMethod);
        }
    };

    this.setSubtitleOffset = function (offset) {
        var offsetValue = parseFloat(offset) * 1000;
        // FIXME: Cannot be called if no subtitles
        //webapis.avplay.setSubtitlePosition(offsetValue);
    }

    this.resetSubtitleOffset = function () {
        this._currentTrackOffset = 0;
        this._showTrackOffset = false;
    }

    this.enableShowingSubtitleOffset = function () {
        this._showTrackOffset = true;
    }

    this.disableShowingSubtitleOffset = function () {
        this._showTrackOffset = false;
    }

    this.isShowingSubtitleOffsetEnabled = function () {
        return this._showTrackOffset;
    }

    this.onEnded = function () {
        var stopInfo = {
            src: this.currentSrc()
        };

        this.Events.trigger(this, 'stopped', [stopInfo]);
    }
};

window['AvplayVideoPlayer'] = function () { return _AvplayVideoPlayer; };