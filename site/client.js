$(document).ready( function() {
    // loads the aqhi and temperature data. Parameter tells which stations to show.
    function loadData( type ) {
        // hide the station type selection form during the data loading.
        var form = $("#typeselect");
        $(form).hide();
        $("#data").load( "api/query/hkdata?type=" +type, function() {
            // data loaded, show the form 
            $(form).show();
        });
    }
    
    // initially load stations that show both aqhi and temperature
    loadData( "both" );
    // add change listeners to the radio buttons that fetch the corresponding data
    $(":radio[name=stations]").on( "change", function() {
        loadData( $(this).val() );
    });
});