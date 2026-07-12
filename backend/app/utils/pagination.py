import math
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

async def paginate(db: AsyncSession, query, page: int, page_size: int):
    """
    Generic pagination utility for SQLAlchemy 2.0 select queries.
    """
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
        
    # Total count query
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Paginated query
    paginated_query = query.offset((page - 1) * page_size).limit(page_size)
    items_result = await db.execute(paginated_query)
    items = list(items_result.scalars().all())
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }
