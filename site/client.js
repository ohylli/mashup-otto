$(document).ready( function() {
    function loadData( type ) {
        $("#data").load( "api/query/hkdata?type=" +type );
    }
    
    loadData( "both" );
    $(":radio[name=stations]").on( "change", function() {
        loadData( $(this).val() );
    });
});