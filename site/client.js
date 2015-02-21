$(document).ready( function() {
    function loadData( type ) {
        var form = $("#typeselect");
        $(form).hide();
        $("#data").load( "api/query/hkdata?type=" +type, function() {
            $(form).show();
        });
    }
    
    loadData( "both" );
    $(":radio[name=stations]").on( "change", function() {
        loadData( $(this).val() );
    });
});