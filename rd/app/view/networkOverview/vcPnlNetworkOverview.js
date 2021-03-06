Ext.define('Rd.view.networkOverview.vcPnlNetworkOverview', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPnlNetworkOverview',
    config: {
        span                        : 'day',
        urlOverviewFor              : '/cake3/rd_cake/network-overviews/overview-for.json',
        item_id                     : false,
        type                        : 'mesh', //default is realm
        dateday                     : false
    },
    resizeSegments: function(pnl){
        var me = this;
        if(pnl.getHeight() > 400){
            me.lookup('pnlNetworkDay').setHeight((pnl.getHeight()-40));
            me.lookup('pnlNetworkWeek').setHeight((pnl.getHeight()-40));
            me.lookup('pnlNetworkMonth').setHeight((pnl.getHeight()-40));
        }
    },
    onClickTodayButton: function(button){
        var me = this;
        me.lookup('btnTimeBack').setTooltip('Go Back 1Day');
        me.lookup('btnTimeForward').setTooltip('Go Forward 1Day');
        me.setSpan('day');
        me.getView().setScrollY(0,{duration: 1000});
    },
    onClickThisWeekButton: function(button){
        var me = this;
        me.lookup('btnTimeBack').setTooltip('Go Back 1Week');
        me.lookup('btnTimeForward').setTooltip('Go Forward 1Week');
        me.setSpan('week');
        var h_one = me.getView().down("pnlNetworkDay").getHeight();
        me.getView().setScrollY(h_one+1,{duration: 1000});
    },
    onClickThisMonthButton: function(button){
        var me = this;
        me.lookup('btnTimeBack').setTooltip('Go Back 1Month');
        me.lookup('btnTimeForward').setTooltip('Go Forward 1Month');
        me.setSpan('month');
        var h_one = me.getView().down("pnlNetworkDay").getHeight();
        var h_two  = me.getView().down("pnlNetworkWeek").getHeight();
        me.getView().setScrollY(h_one+h_two+1,{duration: 1000});
    },
    onClickTimeBack: function(b){
        var me          = this;
        var picker      = me.lookup('dtDate');
        var step        = -1;
        var unit        = Ext.Date.DAY;
        if(me.getSpan()== 'week'){
            step        = -7;
        }
        if(me.getSpan()== 'month'){
            step        = -1;
            unit        = Ext.Date.MONTH;
        }
        me.lookup('btnTimeForward').setDisabled(false);
        var d_current   = picker.getValue();
        var d_back      = Ext.Date.add(d_current, unit, step);
        picker.setValue(d_back);
        
    },
    onClickTimeForward: function(b){
        var me          = this;
        var picker      = me.lookup('dtDate');
        var step        = 1;
        var unit        = Ext.Date.DAY;
        if(me.getSpan()== 'week'){
            step        = 7;
        }
        if(me.getSpan()== 'month'){
            step        = 1;
            unit        = Ext.Date.MONTH;
        }
        var d_current   = picker.getValue();
        var today       = new Date();
        var d_fwd       = Ext.Date.add(d_current, unit, step);
        if(Ext.Date.format(d_fwd,'timestamp') >= Ext.Date.format(today,'timestamp')){
            me.lookup('btnTimeForward').setDisabled(true);
            d_fwd  = today;
        }
        picker.setValue(d_fwd); 
    },
    reload: function(){
        var me = this;
        me.fetchData();
    },
    dateChange: function(dt){
        var me = this;
        //console.log(dt.getRawValue());
        me.fetchData();
    },
    onMeshChange: function(cmb){
        var me = this;
        me.setType('mesh')
        me.setItem_id(cmb.getValue())
        me.fetchData();
    },
    fetchData: function(){
        var me = this;    
        me.getView().setLoading(true);
        var day = me.getView().down('#dtDate').getRawValue();
        me.setDateday(day);
        Ext.Ajax.request({
                url: me.getUrlOverviewFor(),
                params: {
                    type    : me.getType(),
                    item_id : me.getItem_id(),
                    day     : day
                },
                method: 'GET',
                success: function(response){
                    var jsonData = Ext.JSON.decode(response.responseText);
                    me.getView().setLoading(false);     
                    if(jsonData.success){    
                        me.paintDataUsage(jsonData.data);
                      //  if(me.getType()=='user'){
                      //      me.fetchDevicesForUser();
                      //  }
                    }else{

                      
                    }
                }
            });
    },
    paintDataUsage: function(data){
        var me = this;
        Ext.data.StoreManager.lookup('monthMeshStore').setData(data.monthly.graph.items);
        me.getView().down('#monthChart').setSeries(data.monthly.graph.series);    
        Ext.data.StoreManager.lookup('weekNodeStore').setData(data.weekly.nodes_usages);
        Ext.data.StoreManager.lookup('weekMacStore').setData(data.weekly.top_stations);
        
        me.getView().lookup('pnlNetworkWeek').down('cartesian').getStore().setData(data.weekly.graph.items);
        me.getView().lookup('pnlNetworkWeek').down('cartesian').setSeries(data.weekly.graph.series);
    }
});
