from django.contrib import admin
from .models import Transaction
from .service import TransactionService

def send_overdue_notifications(modeladmin, request, queryset):
    """Admin action to send overdue notifications for selected transactions."""
    transaction_service = TransactionService()
    for transaction in queryset:
        if transaction.is_overdue():
            transaction_service.send_overdue_notification(transaction.transaction_id)
    modeladmin.message_user(request, "Overdue notifications sent successfully.")

send_overdue_notifications.short_description = "Send overdue notifications"

# Custom Admin Action: Mark as Returned
def mark_as_returned(modeladmin, request, queryset):
    """Admin action to mark selected transactions as returned."""
    for transaction in queryset:
        if transaction.transaction_type == 'borrow':
            transaction.transaction_type = 'return'
            transaction.save()
    modeladmin.message_user(request, "Selected transactions marked as returned.")

mark_as_returned.short_description = "Mark as returned"

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    # Display Fields
    list_display = (
        'transaction_id',
        'student_name',
        'librarian_name',
        'book_name',
        'transaction_type',
        'borrowed_date',
        'due_date',
        'is_overdue',
    )

    # Search Fields
    search_fields = (
        'student_name',
        'librarian_name',
        'book_name',
        'transaction_type',
    )

    # Filters
    list_filter = (
        'transaction_type',
        'borrowed_date',
        'due_date',
    )

    # Ordering
    ordering = ('-borrowed_date',)

    # Read-Only Fields
    readonly_fields = (
        'transaction_id',
        'student_name',
        'librarian_name',
        'book_name',
        'is_overdue',
    )

    # Fieldsets for Add/Edit Forms
    fieldsets = (
        ('Transaction Details', {
            'fields': (
                'transaction_id',
                'student',
                'user',
                'book',
                'transaction_type',
                'borrowed_date',
                'due_date',
            ),
        }),
        ('Read-Only Information', {
            'fields': (
                'student_name',
                'librarian_name',
                'book_name',
                'is_overdue',
            ),
        }),
    )

    # Custom Actions
    actions = [send_overdue_notifications, mark_as_returned]

    # Method to Display Overdue Status
    def is_overdue(self, obj):
        return obj.is_overdue()

    is_overdue.boolean = True  # Display as a checkbox
    is_overdue.short_description = 'Is Overdue?'