class TankMonitor {

    static create(options) {
        if (window.parent.window.SignalkClient) {
            return(new TankMonitor(window.parent.window.SignalkClient, options));
        }

        if (options) {
            if ((options.server) && (options.port)) {
                return(new TankMonitor(new SignalkClient(options.server, options.port), options));
            } else {
                throw "TankMonitor.create: required option attribute is missing (server and/or port)";
            }
        }

        return(null);
    }

    constructor(signalkClient, options) {
        if ((options) && (options.debug)) console.log("TankMonitor(%s,%s)...", signalkClient, JSON.stringify(options));

        if (!signalkClient) throw "TankMonitor: signalkClient must be specified";
        if (options.container) options.container = (typeof options.container === 'string')?document.querySelector(options.container):options.container;
        if (!options.container) options.container = document.body;
        if (!options.debug) options.debug = false;

        this.signalkClient = signalkClient;
        this.options = options;
        this.tanks = { };

        signalkClient.waitForConnection().then(_ => {
            signalkClient.getEndpoints(endpoints => {
                var tankKeys = new Set();
                endpoints.filter(e => e.startsWith('tanks.')).forEach(e => {
                    var match = e.match(/^tanks.(.*)\..*$/);
                    if ((match) && (match.length == 2)) tankKeys.add(match[1]);
                    console.log(match[1]);
                });
                tankKeys.forEach(tank => {
                    this.options.container.appendChild(this.makeTank(tank, this.switchbanks[switchbank]));
                });
            });
        });

    }

    makeTank(tank) {
        var tankContainer = PageUtils.createElement('div', tank, 'tank-container', null, null);
/*        var switchbankTable = PageUtils.createElement('div', null, 'table switchbank-table', null, switchbankContainer);
        var switchbankTableRow = PageUtils.createElement('div', null, 'switchbank-table-row', null, switchbankTable);
        var switchbankTableHeader = PageUtils.createElement('div', null, 'table-cell switchbank-table-header', document.createTextNode(instance.toUpperCase()), switchbankTableRow);
        var switchbankTableChannelContainer = PageUtils.createElement('div', null, 'table-cell switchbank-table-channel-container', null, switchbankTableRow); 
        var switchbankChannelTable = PageUtils.createElement('div', null, 'table switchbank-channel-table', null, switchbankTableChannelContainer);
        var switchbankChannelTableRow = PageUtils.createElement('div', null, 'table-row switchbank-channel-table-row', null, switchbankChannelTable);
        channels.forEach(key => {
            var path = "electrical.switches.bank." + key;
            var switchbankChannelCell = PageUtils.createElement('div', 'CH' + key, 'table-cell switchbank-channel-cell artifact', null, switchbankChannelTableRow);
            switchbankChannelCell.addEventListener('click', function(e) { this.operateSwitch(e.currentTarget.id.substr(2), e.currentTarget.classList.contains('on')); }.bind(this));
            var channelId = (key.includes('.'))?key.slice(key.lastIndexOf('.') + 1):key;
            var switchbankChannelCellKey = PageUtils.createElement('span', null, 'key hidden', document.createTextNode(channelId), switchbankChannelCell);  
            var switchbankChannelCellName = PageUtils.createElement('span', null, 'name', document.createTextNode(channelId), switchbankChannelCell);  
            if (Number.isNaN(parseInt(instance, 10))) switchbankChannelCell.classList.remove('artifact');

            this.signalkClient.getValue(path + '.meta', function(sbc, v) {
                sbc.classList.remove('artifact'); switchbankContainer.classList.remove('hidden');
                if (v.type) sbc.classList.add(v.type);
                if (v.name) {
                    sbc.querySelector('.name').innerHTML = v.name;
                    sbc.querySelector('.key').classList.remove('hidden');
                }
            }.bind(this, switchbankChannelCell), (v) => v.value);
            

            this.signalkClient.registerCallback(path + '.state', function(sbc,v) {
                var millis = Date.UTC() - Date.parse(v.timestamp);
                if (millis > 150000) sbc.classList.add('expired'); else sbc.classList.remove('expired');
                if (v.value) { sbc.classList.add('on'); sbc.classList.remove('off'); } else { sbc.classList.add('off'); sbc.classList.remove('on'); }
            }.bind(this, switchbankChannelCell), (v) => v);

        });
        return(switchbankContainer);
*
    }

}